class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something gone wrong",
        statck = "",
        errors = []
    ){
        super(message)
        this.statusCode = statusCode
        this.errors = errors
        this.message = message
        this.data = null
        this.success = false
        
        if(statck){
            this.stack = statck
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}