from flask import request
import time

from helper import Response
from handler.auth import Token


state = False

class Register():


    async def register(id, hash, phone):
        try:
            print(id)
        except Exception as e:
            print(e)
            return Response.create(e.message, 'Your request has successfully reached its destination but there are some errors', 500)

        return Response.create(Token.create({
            id: id, hash: hash, phone: phone
        }), 'Your request has successfully reached its destination')


    async def deregister(token):
        try:
            print(id)
        except Exception as e:
            print(e)
            return Response.create(e.message, 'Your request has successfully reached its destination but there are some errors', 500)

        return Response.create({
            id: id, hash: hash, phone: phone
        }, 'Your request has successfully reached its destination')


class Message():

    def __init__(self, socketio):
        self.sio = socketio



    def __sendMessage(self):
        global state
        while state == True:
            self.sio.emit('tims-request-send-message', ['hello', 'there'])
            time.sleep(1)

        
    def startInterval(self):
        global state
        state = True
        self.__sendMessage()


    def stopInterval(self):
        global state
        state = False
        self.__sendMessage()


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