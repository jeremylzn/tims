import jwt
from sys import platform

JWT_SECRET='SECRET_NO_SECRET'
JWT_ALGORITHM='HS256'

class Token():

    def create(data):
        encodedString = jwt.encode(data, JWT_SECRET, JWT_ALGORITHM)
        if platform == 'linux' or platform == 'linux2':
            return encodedString.decode('UTF-8')
        return encodedString


    def retrieve(token):
        return jwt.decode(token, JWT_SECRET, JWT_ALGORITHM)