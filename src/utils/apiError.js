class apiError extends Error{
    constructor(
        statusCode,
        message= "OOooppPS!!!!!!! Something Went WRong ",
        errors=[],
        stack=""
    ){
        super(message)
        this.statusCode=statusCode
        this.data=null
        this.message=message
        this.success=false
        this.errors=errors


        if (stack) {
            this.stack=stack
            
        } else {
            Error.captureStackTrace(this , this.constructor)
        }
    }
}

export default apiError