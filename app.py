# pip install pyjwt
# pip install flask_cors
# pip install flask
# pip install telethon

from flask import Flask, request, render_template, jsonify
from flask_cors import CORS

import time


from handler import Register, Message
from helper import Response

app = Flask(__name__)
app.testing = True
CORS(app)


# FETCH HOME PAGE
@app.route("/")
def html():

    return render_template("index.html")


# TELEGRAM APP REGISTRATION
@app.route("/register", methods=["POST"])
async def register():
    try:

        req = request.json

        api_id = str(req["api_id"])
        api_hash = str(req["api_hash"])
        phone = str(req["phone"])
        if phone == "":
            raise ValueError("Phone number must be provided!")

        return await Register.registerTelegramClient(api_id, api_hash, phone)

    except Exception as e:
        return Response.error({}, "#register - " + str(e))


@app.route("/confirm/code", methods=["POST"])
async def confirm_code():
    try:
        req = request.json

        step = "code"
        api_id = str(req["api_id"])
        api_hash = str(req["api_hash"])
        phone = str(req["phone"])
        phone_code = str(req["phone_code"])
        phone_code_hash = str(req["phone_code_hash"])

        return await Register.confirmAuthenticationDetails(
            step, api_id, api_hash, phone, phone_code, phone_code_hash
        )
    except Exception as e:
        return Response.error({}, "#confirm_code - " + str(e))


@app.route("/confirm/password", methods=["POST"])
async def confirm_password():
    try:
        req = request.json

        step = "password"
        api_id = str(req["api_id"])
        api_hash = str(req["api_hash"])
        phone = str(req["phone"])
        phone_code = str(req["phone_code"])
        phone_code_hash = str(req["phone_code_hash"])
        password = str(req["password"])

        return await Register.confirmAuthenticationDetails(
            step, api_id, api_hash, phone, phone_code, phone_code_hash, password
        )
    except Exception as e:
        return Response.error({}, "#confirm_password - " + str(e))


@app.route("/deregister", methods=["POST"])
async def deregister():
    try:
        req = request.json
        return await Register.deregister(req["token"])
    except Exception as e:
        return Response.error({}, "#deregister - " + str(e))


@app.route("/message", methods=["POST"])
async def message():
    req = request.json
    return Response.success(await Message.sendMessage(req), "")


# @app.route("/message/stop", methods=["POST"])
# async def stopMessage():
#     req = request.json
#     return Response.success(req, "")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port="80", debug=True)
