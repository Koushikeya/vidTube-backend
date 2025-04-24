// async tasks can be handled through 2 ways 

// through Promises

const asyncHandler = (reqHandler) =>{
    (res, rej, next) => {Promise.resolve(reqHandler(res, rej, next)).catch((err)=>{next(err)})}
}







/* const asyncHandler = (fn) => async (req,res,next)=>{
        try {
            await fn(req,res,next)
        } catch (error) {
          res.status(error.code || 403).json({
            success: false,
            message: error.message
          })  
        }
    }
 */


export  { asyncHandler }