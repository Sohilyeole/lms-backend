import AppError from "../utils/error.utlil.js";
import jwt from "jsonwebtoken"



const isLoggedIn=  async(req,res,next)=>{
  console.log("hiiiii in login in")
   
  // const token=document.cookie ||null;
   const token=(req.cookies && req.cookies.token) || null; //ye ho rha hai due to cookie parser in app.js
    console.log(token)
    if(!token){
      console.log("fksb")
        return next(new AppError("Unauthenticated ,please login again",401))
    }
    // console.log(process.env.JWT_SECRET)

    const userDetail=jwt.verify(token,"SECRET");
    console.log(userDetail)
    
    req.user=userDetail;
   

    next();
    
}  
const authorizedRoles=(...roles)=> async(req,res,next)=>{
    const currentUserRole=req.user.role;
    console.log(req.user)
    console.log("vsiciadiuvou")
    if(!(roles.includes(currentUserRole))){
        return next(new AppError("you do not have permission to acess this",403))
    }
    console.log("passed in authorizedd role")
    next();
}
const authorizedSubscriber=async(req,res,next)=>{
  console.log(req.user)
    const currentUserRole=req.user.role;
  const subscription=req.user.subsciprtion;
  console.log("hitsh",subscription)
  if(currentUserRole !=="ADMIN" && subscription.status !=="active"){
    return next(new AppError("please subscribe to acess this route",403))
  }
  next();
}

export { isLoggedIn,authorizedRoles,authorizedSubscriber}