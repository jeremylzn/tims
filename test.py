from telethon import TelegramClient, sync

api_id = 6213869
api_hash = 'e51d8b97ae6c39efab73125cadf23676'


client = TelegramClient('session/' + api_hash, api_id, api_hash)
client.connect()
phone = '+447424928497'
client.send_code_request(phone)
code = input('Enter code: ')
client.sign_in(phone=phone, code=code)


client.send_message('timsTestChannels', 'Hello to myself!')
client.log_out()

# from telethon import TelegramClient

# client = TelegramClient('session/test', api_id, api_hash)

# async def main():
#     await client.send_message('me', 'Hello to myself!')

# with client:
#     client.loop.run_until_complete(main())