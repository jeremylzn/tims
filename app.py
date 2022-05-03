# pip install pyjwt
# pip install flask_cors
# pip install flask
# pip install flask_socketio

from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import time


from handler import Register, Message
from helper import Response

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app)
msgCtrl = Message(socketio)




@app.route('/')
def html():
    return render_template('index.html')


@app.route('/register', methods=['POST'])
async def register():
    req = request.json
    return await Register.register(req['id'], req['hash'], req['phone'])


@app.route('/confirm', methods=['POST'])
async def confirm():
    req = request.json
    return await Register.confirm(req['token'], req['phone_code'])



@app.route('/message', methods=['POST'])
async def message():
    req = request.json
    return msgCtrl.startInterval(req)


@app.route('/message/stop', methods=['POST'])
async def stopMessage():
    req = request.json
    return msgCtrl.stopInterval()


@app.route('/deregister', methods=['POST'])
async def deregister():
    req = request.json
    return await Register.deregister(req['token'])

if __name__ == '__main__':
    # app.run(host='0.0.0.0', port='80', debug=True, threaded=True)
    socketio.run(app, host='0.0.0.0', port='80', debug=True)