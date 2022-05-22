from telethon import TelegramClient, functions, errors
from telethon.sessions import StringSession
import time
import os

import threading

from helper import Response
from handler.auth import Token


error_msg = "Your request has successfully reached its destination but there are some internal errors!"
session_path = "session/"


class Register:
    async def registerTelegramClient(api_id, api_hash, phone):
        global session_path
        try:
            client = TelegramClient(session_path + api_hash, api_id, api_hash)
            await client.connect()
            code_request = await client.send_code_request(phone)
            await client.disconnect()
            return Response.success(
                {
                    "api_id": api_id,
                    "api_hash": api_hash,
                    "phone": phone,
                    "phone_code_hash": str(code_request.phone_code_hash),
                },
                "Registration details accepted!",
            )
            client.log_out()
        except Exception as e:
            return Response.error({}, "#handler/registerTelegramClient - " + str(e))

    async def confirmAuthenticationDetails(
        step, api_id, api_hash, phone, phone_code, phone_code_hash, password=None
    ):
        global session_path

        try:
            client = TelegramClient(session_path + api_hash, api_id, api_hash)
            await client.connect()
            stringSession = StringSession.save(client.session)

            if step == "code":
                await client.sign_in(
                    phone=phone, code=phone_code, phone_code_hash=phone_code_hash
                )
                await client.disconnect()

            elif step == "password":
                await client.sign_in(password=password)
                await client.disconnect()

            if os.path.exists(session_path + api_hash + ".session"):
                os.remove(session_path + api_hash + ".session")

            return Response.success(
                {
                    "token": Token.encode(
                        {
                            "api_id": api_id,
                            "api_hash": api_hash,
                            "phone": phone,
                            "phone_code_hash": phone_code_hash,
                            "access_token": stringSession,
                        }
                    )
                },
                "Registration completed!",
            )

        except errors.SessionPasswordNeededError:
            return Response.required(
                {
                    "api_id": api_id,
                    "api_hash": api_hash,
                    "phone": phone,
                    "phone_code": phone_code,
                    "phone_code_hash": phone_code_hash,
                    "access_token": stringSession,
                },
                "Password required!",
                ["password"],
            )

        except Exception as e:
            if os.path.exists(session_path + api_hash + ".session"):
                os.remove(session_path + api_hash + ".session")
            return Response.error(
                {}, "#handler/confirmAuthenticationDetails - " + str(e)
            )

    async def deregister(token):

        try:
            decode = Token.decode(token)
            client = TelegramClient(
                StringSession(decode["access_token"]),
                decode["api_id"],
                decode["api_hash"],
            )
            await client.connect()
            await client(functions.auth.LogOutRequest())
            return Response.success({}, "Deregistration completed!")
        except Exception as e:
            return Response.error({}, "#handler/deregister - " + str(e))


class Message:
    async def sendMessage(requestdata={}):
        global session_path

        decoded = Token.decode(requestdata["token"])
        message = requestdata["message"]
        channels = requestdata["channels"]

        access_token = decoded["access_token"]
        api_id = decoded["api_id"]
        api_hash = decoded["api_hash"]

        success = []
        unsuccess = []

        async with TelegramClient(
            StringSession(access_token), api_id, api_hash
        ) as client:

            await client.connect()
            for channel in channels:

                try:
                    await client.send_message(
                        channel, message, link_preview=True, parse_mode="md"
                    )
                    success.append({"channel": channel})

                except errors.rpcerrorlist.SlowModeWaitError as e:
                    unsuccess.append(
                        {
                            "channel": channel,
                            "reason": "SlowModeWaitError for "
                            + str(e.seconds)
                            + " seconds",
                            "error": str(e.message),
                            "type": "slowmode",
                        }
                    )
                    pass
                except errors.rpcerrorlist.ChannelPrivateError as e:
                    unsuccess.append(
                        {
                            "channel": channel,
                            "reason": "ChannelPrivateError",
                            "error": str(e.message),
                            "type": "privacy",
                        }
                    )
                    pass
                except errors.rpcerrorlist.ChatWriteForbiddenError as e:
                    unsuccess.append(
                        {
                            "channel": channel,
                            "reason": "ChatWriteForbiddenError",
                            "error": str(e.message),
                            "type": "forbidden",
                        }
                    )
                    pass
                except errors.rpcerrorlist.ChatRestrictedError as e:
                    unsuccess.append(
                        {
                            "channel": channel,
                            "reason": "ChatRestrictedError",
                            "error": str(e.message),
                            "type": "restricted",
                        }
                    )
                    pass
                except errors.rpcerrorlist.UserBannedInChannelError as e:
                    unsuccess.append(
                        {
                            "channel": channel,
                            "reason": "UserBannedInChannelError",
                            "error": str(e.message),
                            "type": "banned",
                        }
                    )
                    pass
                except errors.rpcerrorlist.TimeoutError as e:
                    unsuccess.append(
                        {
                            "channel": channel,
                            "reason": "TimeoutError",
                            "error": str(e),
                            "type": "timeout",
                        }
                    )
                    pass
                except Exception as e:
                    unsuccess.append(
                        {
                            "channel": channel,
                            "reason": str(e),
                            "error": "restart shilling without this channel",
                            "type": "general",
                        }
                    )
                    pass

        await client.disconnect()
        return {
            "status": "working",
            "data": requestdata,
            "stats": {"success": success, "unsuccess": unsuccess},
        }
