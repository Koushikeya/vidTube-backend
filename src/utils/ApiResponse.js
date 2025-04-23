class ApiResponse {
    constructor(statusCode, message="Success", data){
        this.errors = errors
        this.data = data
        this.statusCode = statusCode
        this.success = statusCode < 400
        this.message = message
    }
}