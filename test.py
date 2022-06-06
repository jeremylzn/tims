from telethon import TelegramClient, functions, errors
from telethon.sessions import StringSession

import threading
import asyncio
import time
from os import listdir
from os.path import isfile, join
import json
import logging

logging.basicConfig(filename='bot_log',
                    filemode='a',
                    format='%(asctime)s,%(msecs)d %(name)s %(levelname)s %(message)s',
                    datefmt='%H:%M:%S',
                    level=logging.DEBUG)

logging.info("Running Urban Planning")

# logger = logging.getLogger('urbanGUI')

session_path = "./session/"

json_path = "./json/"

async def sendMessage(channel, message, app_id, app_hash, session):

    async with TelegramClient(session_path + session, app_id, app_hash) as client:

        await client.connect()
        me = await client.get_me()

        logging.info("Working with", me.first_name)
        await client.send_message(channel, message, link_preview=True)


def getFilesList(path):
    files = [f for f in listdir(path) if isfile(join(path, f))]
    return files


def main():

    try:

        channels_limit = 50
        message = """ Hey! \nJ'ai trouver une faille sur un casino 😆 \nLe telegram : https://t.me/predicteurcoinminer/10 \nJ'ai déposé 50€ le casino m'a donné 100€"""
        channels = ["damienlexpert", "bouvierjb", "TchoFlo", "CorentinN", "Belitre", "Radionri"]

        # channels = ["damienlexpert"]

        jsons = getFilesList(json_path)

        accounts_used = []

        while True:

            if (not len(jsons)):
                jsons = accounts_used
                accounts_used = []

            for i, account in  enumerate(jsons):


                json_file = open(json_path + account)
                data = json.load(json_file)
                json_file.close()
                app_id = data['app_id']
                app_hash = data['app_hash']
                first_name = data['first_name']
                last_name = data['last_name']

                logging.info(f'@ Account no {i + 1} : {app_id} - Name : {last_name} {first_name} ')

                for index, channel in enumerate(channels):

                    logging.info(f'{index}) app id : {app_id} and channel {channel} (channels size : {len(channels)})')

                    time.sleep(60)
                    # loop = asyncio.new_event_loop()
                    # asyncio.set_event_loop(loop)
                    # result = loop.run_until_complete(sendMessage(channel, message, app_id, app_hash, data['session_file']))


                    if (index % channels_limit == 0 and index > 0) or (len(channels) <= channels_limit): 
                        logging.info(f'@ Rotate account every {channels_limit} channels')
                        accounts_used.append(account)
                        jsons.remove(account)
                        del channels[:index + 1]
                        break
                        

                if(not len(channels)):
                    logging.info('@ All the channels are finish')
                    return
                

            

    except Exception as e:
        logging.info(e)



main()