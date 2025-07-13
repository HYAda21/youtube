const asyncHandler = (requestHandler)=>{
    (req,res,next)=>{
    Promise.resolve(requestHandler(req,res,next)).
    catch((err) => next(err))
    }
}




export {asyncHandler}





//it define step by step how its comes
//const asyncHandler= ()=>{}
//const asyncHandler= (func)=>()=>{}
//const asyncHandler = (func)=>async()=>{}



/*const asyncHandler = (fn)=>async(req,res,next)=>{
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
        
    }
}*/
// as it is use as try catch there is another method as for middware as promise