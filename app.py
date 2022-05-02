from flask import Flask, request, render_template, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def html():
    return render_template('index.html')

@app.route('/register', methods=['POST'])
def register():
    print(request.json)
    return request.json


@app.route('/message', methods=['POST'])
def message():
    body = request.json
    return body 


if __name__ == '__main__':
    app.run(host='0.0.0.0', port='80', debug=True, threaded=True)