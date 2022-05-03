class Response():
    
    def create(data, message, status=200):
        return {
            'data': data,
            'message': message
        }, status


