from telethon import TelegramClient, functions, types, errors
from telethon.sessions import StringSession
from flask import request, abort
import time
import os

from helper import Response
from handler.auth import Token
from handler.telethon import THandler


state = False
count = 1
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
        while state == True:
            self.sio.emit('tims-request-send-message', {
                'count': count,
                'status': 'working',
                'data': requestdata
            })

            channels = ('timsTestChannels', 'TestTelegram2025', 'TestTelegram2024')

            for channel in channels:
                # print(channel)
                await THandler.send_message(channel)
                # THandler.aborted()

            

            count += 1
            # time.sleep(int(requestdata['interval']) * 60 if int(requestdata['interval']) else 60)
            time.sleep(int(requestdata['interval']) * 5 if int(requestdata['interval']) else 5)


        
    async def startInterval(self, req):
        global state
        state = True
        if int(req['interval']) < 1:
            req['interval'] = '1'
        if int(req['interval']) > 60:
            req['interval'] = '60' 
        await self.__sendMessage(req)
        return Response.create({}, 'Loop ended!')


    async def stopInterval(self):
        global state
        global count
        state = False
        await self.__sendMessage()

        self.sio.emit('tims-request-send-message', {
            'count': count,
            'status': 'standby'
        })
        return Response.create({}, 'Loop ended successfully!')
