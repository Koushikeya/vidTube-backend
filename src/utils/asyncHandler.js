// async tasks can be handled through 2 ways

// through Promises

const asyncHandler = (reqHandler) => {
  return  (req, res, next) => {
    Promise.resolve(reqHandler(req, res, next)).catch((err) => {
      next(err);
    });
  };
};

export { asyncHandler };

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
