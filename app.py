# pyjwt
# flask_cors
# flask
# flask_socketio

from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import time


from handler import Register, Message
from helper import Response

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app)




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
    return {
        'confirmed': True,
        'message': 'Destination route reached!',
        'data': req
    }


@app.route('/message', methods=['POST'])
async def message():
    req = request.json
    Message(socketio).startInterval()
    
    return Response.create('data', 'message')


@app.route('/message/stop', methods=['POST'])
async def stopMessage():
    req = request.json
    Message(socketio).stopInterval()

    return Response.create('data', 'message')


# while True:
#     emit('tims-request-send-message', ['hello', 'there'])
#     time.sleep(1)

if __name__ == '__main__':
    # app.run(host='0.0.0.0', port='80', debug=True, threaded=True)
    socketio.run(app, host='0.0.0.0', port='80', debug=True)