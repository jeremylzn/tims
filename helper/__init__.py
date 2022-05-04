class Response():
    
    def create(data, message, status=200):
        return {
            'data': data,
            'message': message
        }, status

    def error(data, message):
        return {
            'status': False,
            'data': data,
            'message': message
        }, 200

    def success(data, message):
        return {
            'status': True,
            'data': data,
            'message': message
        }, 200

    def required(data, message, required_fields):
        return {
            'status': True,
            'required': True,
            'data': data,
            'message': message,
            'required_fields': required_fields
        }, 200



