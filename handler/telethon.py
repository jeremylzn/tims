from telethon import TelegramClient, functions, types, errors
from telethon.sessions import StringSession

from flask import abort

import os

session_path = 'session/'


class THandler():



    


    async def send_message(access_token, api_id, api_hash, channel, message):
        try:
            global session_path            

            client = TelegramClient(session_path + api_hash, api_id, api_hash)
            await client.connect()

            await client.send_code_request(phone)
            code = input('Enter code: ')
            await client.sign_in(phone=phone, code=code)
            # print(channel)

            await client.send_message(channel, 'Hello from TIMS!')
            

        except Exception as e:
            print(e)