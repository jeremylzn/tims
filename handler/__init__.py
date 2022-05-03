from flask import request
import time

from helper import Response
from handler.auth import Token


state = False
count = 1
error_msg = 'Your request has successfully reached its destination but there are some internal errors!'

class Register():


    async def register(id, hash, phone):
        try:
            print((id, hash, phone))
        except Exception as e:
            print(e)
            return Response.create(e.message, error_msg)

        return Response.create(Token.create({
            id: id, hash: hash, phone: phone
        }), 'Registration details accepted!')


    async def confirm(token, phone_code):
        try:
            decoded = Token.retrieve(token)
            print(decoded)
        except Exception as e:
            print(e)
            return Response.create(e, error_msg)

        return Response.create(Token.create({
                'id': decoded['id'], 'hash': decoded['hash'], 'phone': decoded['phone'],
                'phone_code': phone_code
            }), 'Registered successfully!')



    async def deregister(token):
        try:
            print(token)
        except Exception as e:
            print(e)
            return Response.create(e.message, error_msg)

        return Response.create(token, 'Deregistration completed!')


class Message():

    def __init__(self, socketio):
        self.sio = socketio


    def __sendMessage(self, requestdata={}):
        global count
        global state
        while state == True:
            self.sio.emit('tims-request-send-message', {
                'count': count,
                'status': 'working',
                'data': requestdata
            })
            count += 1
            time.sleep(int(requestdata['interval']) * 60 if int(requestdata['interval']) else 60)

        
    def startInterval(self, req):
        global state
        state = True
        if int(req['interval']) < 1:
            req['interval'] = '1'
        if int(req['interval']) > 60:
            req['interval'] = '60' 
        self.__sendMessage(req)
        return Response.create({}, 'Loop ended!')


    def stopInterval(self):
        global state
        global count
        state = False
        self.__sendMessage()

        self.sio.emit('tims-request-send-message', {
            'count': count,
            'status': 'standby'
        })
        return Response.create({}, 'Loop ended successfully!')


def sendMessage():
    # sio.emit('tims-request-send-message', ['hello', 'there'])
    print('hi')


# i = 1
#         while i == 1:
#             if(self.state):
#                 print(self.state)
#                 self.sio.emit('tims-request-send-message', ['hello', 'there'])
#                 time.sleep(1)
#                 i = 1
#             else:
#                 i = 0