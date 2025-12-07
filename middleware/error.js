import ErrorHandler from "../utils/errorHandler.js";

const errorMiddleWare = (err,req,res,next)=>{
    err.statusCode = err.statusCode||500;
    err.message = err.message||"Internal server error";
    if(err.name==="CastError")
    {
        const message = `Resource not found. Invalid ${err.path}`
        err = new ErrorHandler(message,400);
    }
    // Mongoose duplicate key error
    if(err.code===11000)
    {
        const message = `User ${Object.keys(err.keyValue)} already exist please try login`
        err = new ErrorHandler(message,400);
    }
    //Wrong jwt errorr
    if(err.name==="JsonWebTokenError")
    {
        const message = "Json web token is invalid, Try again";
        err = new ErrorHandler(message,400);
    }
    //JWT Expired
    if(err.name==="TokenExpiredError")
    {
        const message = "Json web token is expired, Try again";
        err = new ErrorHandler(message,400);
    }
    res.status(err.statusCode).json({
        success:false,
        message:err.message
    });
}

export default errorMiddleWare;