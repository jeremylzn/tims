from telethon import TelegramClient, functions, errors
from telethon.sessions import StringSession
import time
import os

from helper import Response
from handler.auth import Token


state = False
count = 0
error_msg = 'Your request has successfully reached its destination but there are some internal errors!'
session_path = 'session/'

class Register():


    async def registerTelegramClient(api_id, api_hash, phone):
        global session_path
        try:
            client = TelegramClient(session_path + api_hash, api_id, api_hash)
            await client.connect()
            code_request = await client.send_code_request(phone)
            await client.disconnect()
            return Response.success({
                'api_id': api_id,
                'api_hash': api_hash,
                'phone': phone,
                'phone_code_hash': str(code_request.phone_code_hash)
            }, 'Registration details accepted!')
            client.log_out()
        except Exception as e:
            return Response.error({}, '#handler/registerTelegramClient - ' + str(e))


    async def confirmAuthenticationDetails(step, api_id, api_hash, phone, phone_code, phone_code_hash, password=None):
        global session_path

        try:
            client = TelegramClient(session_path + api_hash, api_id, api_hash)
            await client.connect()
            stringSession = StringSession.save(client.session)

            if step == 'code':
                await client.sign_in(phone=phone, code=phone_code, phone_code_hash=phone_code_hash)
                await client.disconnect()

            elif step == 'password':
                await client.sign_in(password=password)
                await client.disconnect()


            if os.path.exists(session_path + api_hash + '.session'):
                os.remove(session_path + api_hash + '.session')

            return Response.success({
                'token': Token.encode({
                    'api_id': api_id,
                    'api_hash': api_hash,
                    'phone': phone,
                    'phone_code_hash': phone_code_hash,
                    'access_token': stringSession
                    })
            }, 'Registration completed!')

            
            
        except errors.SessionPasswordNeededError:
            return Response.required({
                'api_id': api_id,
                'api_hash': api_hash,
                'phone': phone,
                'phone_code': phone_code,
                'phone_code_hash': phone_code_hash,
                'access_token': stringSession
            }, 'Password required!', ['password'])
            
        except Exception as e:
            return Response.error({}, '#handler/confirmAuthenticationDetails - ' + str(e))



    async def deregister(token):
        
        try: 
            decode = Token.decode(token)
            client = TelegramClient(StringSession(decode['access_token']), decode['api_id'], decode['api_hash'])
            await client.connect()
            await client(functions.auth.LogOutRequest())
            return Response.success({}, 'Deregistration completed!')
        except Exception as e:
            return Response.error({}, '#handler/deregister - ' + str(e))






class Message():

    def __init__(self, socketio):
        self.sio = socketio


    async def __sendMessage(self, requestdata={}):

        global count
        global state
        global session_path

        while state == True:  

            success = []
            unsuccess = []
            error = []
            decodedToken = Token.decode(requestdata['token'])
            async with TelegramClient(StringSession(decodedToken['access_token']), decodedToken['api_id'], decodedToken['api_hash']) as client:

                await client.connect()
                for channel in requestdata['channels']:
                    
                    try:
                        await client.send_message(channel, requestdata['message'], link_preview=True, parse_mode='md')
                        
                        
                        count += 1
                        success.append({
                            'channel': channel['username']
                        })


                    except errors.rpcerrorlist.SlowModeWaitError as e:
                        unsuccess.append({
                            'channel': channel,
                            'reason': 'SlowModeWaitError for '+str(e.seconds)+' seconds',
                            'error': str(e.message),
                            'type': 'slowmode'
                        })
                        pass
                    except errors.rpcerrorlist.ChannelPrivateError as e:
                        unsuccess.append({
                            'channel': channel,
                            'reason': 'ChannelPrivateError',
                            'error': str(e.message),
                            'type': 'privacy'
                        })
                        pass
                    except errors.rpcerrorlist.ChatWriteForbiddenError as e:
                        unsuccess.append({
                            'channel': channel,
                            'reason': 'ChatWriteForbiddenError',
                            'error': str(e.message),
                            'type': 'forbidden'
                        })
                        pass
                    except errors.rpcerrorlist.ChatRestrictedError as e:
                        unsuccess.append({
                            'channel': channel,
                            'reason': 'ChatRestrictedError',
                            'error': str(e.message),
                            'type': 'restricted'
                        })
                        pass
                    except errors.rpcerrorlist.UserBannedInChannelError as e:
                        unsuccess.append({
                            'channel': channel,
                            'reason': 'UserBannedInChannelError',
                            'error': str(e.message),
                            'type': 'banned'
                        })
                        pass
                    except errors.rpcerrorlist.TimeoutError as e:
                        unsuccess.append({
                            'channel': channel,
                            'reason': 'TimeoutError',
                            'error': str(e),
                            'type': 'timeout'
                        })
                        pass
                    except Exception as e:
                        error.append({
                            'channel': channel,
                            'reason': str(e),
                            'error': 'restart shilling without this channel',
                            'type': 'general'
                        })
                        pass

                await client.disconnect()


            self.sio.emit('tims-request-send-message', {
                'count': count,
                'status': 'working',
                'data': requestdata,
                'stats': {
                    'success': success,
                    'unsuccess': unsuccess,
                    'error': error
                }
            })
            # time.sleep(int(requestdata['interval']) * 60 if int(requestdata['interval']) else 60)
            time.sleep(int(requestdata['interval']) * 5 if int(requestdata['interval']) else 5)


   


        
    async def startInterval(self, req):
        try:
            global state
            state = True

            if int(req['interval']) < 1:
                req['interval'] = '1'
            if int(req['interval']) > 60:
                req['interval'] = '60' 

            await self.__sendMessage(req)
            return Response.success({}, 'Loop exited from start function!')

        except Exception as e:
            return Response.error({}, '#handler/startInterval - ' + str(e))


    async def stopInterval(self):
        try:
            global state
            global count
            state = False
            await self.__sendMessage()

            self.sio.emit('tims-request-send-message', {
                'count': count,
                'status': 'standby'
            })

            return Response.success({}, 'Loop ended successfully!')
        except Exception as e:
            return Response.error({}, '#handler/stopInterval - ' + str(e))
