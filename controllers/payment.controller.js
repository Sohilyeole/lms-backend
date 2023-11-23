import User from "../models/user.model.js";
import AppError from "../utils/error.utlil.js";
import razorpay from "../server.js"
import Payment from "../models/payment.model.js";
import crypto from "crypto"
  const getRazorpayApiKey= (req,res,next)=>{
     res.status(200).json({
        sucess:true,
        message:"Razorpay Api Key",
        key:"rzp_test_HXnQ1qzQqHUF0V",
        // pXpFDMS7ds28bBNhn3ziVWxK
        // plan_McTBxHti8AfP8b

     });
  }
  const  buySubscription=async(req,res,next)=>{
    
    const { id } = req.user;
    const user=await User.findById(id);
    try {
        console.log("sohillllllalaala",req.user)
        if(!user){
            return next(new AppError("unauthirized,please login",400))
        }
        if(user.role=="ADMIN"){
            return next(new AppError("Admin cannot purchase Our subscription",400))
        }
   
      
            const subscription = await razorpay. subscriptions.create({
                plan_id: "plan_McTBxHti8AfP8b", // The unique plan ID
                customer_notify: 1, // 1 means razorpay will handle notifying the customer, 0 means we will not notify the customer
                total_count: 12, // 12 means it will charge every month for a 1-year sub.
              });
              console.log("sohiloo345")
              console.log(subscription.id)
             
        user.  subsciprtion.id=subscription.id;
        user.  subsciprtion.status=subscription.status;
        await user.save();
        console.log("same");
        res.status(200).json({
            sucess:true,
            message:"Subscrbed sucessfully",
            subscription_id: subscription.id
         
    
        })
    } catch (error) {
        console.log(error.message)
    }
   
    
  }
  const   verifySubscription= async(req,res,next)=>{
    const{id}=req.user;
    const{razorpay_payment_id,razorpay_signature,razorpay_subscription_id}=req.body;
    try {
        const user=await User.findById(id)
        console.log("sohil verify",user)
    if(!user){
        return next(new AppError("unauthorized please login again",400))
    }
    const subscriptionid=user. subsciprtion.id;
    const genratedSignature=crypto
    .createHmac('sha256',"pXpFDMS7ds28bBNhn3ziVWxK")
    .update(`${razorpay_payment_id}|${subscriptionid}`)
    .digest('hex');
    console.log(genratedSignature)
    console.log(razorpay_signature)
    if(genratedSignature !== razorpay_signature){
        return next(new AppError("Payment not verified,please try again",500))
    }
    await Payment.create({
        razorpay_payment_id,razorpay_signature,razorpay_subscription_id
    })
    user.subsciprtion.status="active";
    await user.save();
    res.status(200).json({
       sucess:true,
       message:"verifyed sucessfully"
    })
    } catch (error) {
        console.log(error.message)
    }
    
    
  }
  const cancelSubscription= async(req,res,next)=>{
    console.log("hiiii in")
    const {id}=req.user;
    console.log(id)
    const user=await User.findById(id);
    try {
        if(!user){
            return next(new AppError("Unauthorized ,please login"))
        }
        if(user.role =="ADMIN"){
            return next(new AppError("admin cant cancel",400))
        }
        const subsciprtionId=user.subsciprtion.id;
        const subscription=await razorpay.subscriptions.cancel(subsciprtionId);
        console.log("hjhjjhj",subscription)
        user.subsciprtion.status=subscription.status;
         await user.save()
         res.status(200).json({
            sucess:true,
            message:"verifyed sucessfully"
         })
    } catch (error) {
        console.log(error.message)
    }
   
    
  }
//   const allPayments= async(req,res,next)=>{
//     const {count}=req.query;
//     console.log(count)
//     try {
//         console.log(razorpay)
//     const subscriptions= await razorpay.subscriptions.all({
//         count:count ||10
//     });
//     res.status(200).json({
//        sucess:true,
//        message:"all payments",
//        subscriptions
//     })
//     } catch (error) {
//         return next(new AppError(error.message,500))
//     }
    
    
//   }

 const allPayments = async (req, res, next) => {
    const { count, skip } = req.query;
  
    // Find all subscriptions from razorpay
    const allPayments = await razorpay.subscriptions.all({
      count: count ? count : 10, // If count is sent then use that else default to 10
      skip: skip ? skip : 0, // // If skip is sent then use that else default to 0
    });
    // console.log("hii",allPayments.items.length)
  
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
  
    const finalMonths = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0,
    };
  
    const monthlyWisePayments = allPayments.items.map((payment) => {
      // We are using payment.start_at which is in unix time, so we are converting it to Human readable format using Date()
      const monthsInNumbers = new Date(payment.start_at * 1000);
  
      return monthNames[monthsInNumbers.getMonth()];
    });
  
    monthlyWisePayments.map((month) => {
      Object.keys(finalMonths).forEach((objMonth) => {
        if (month === objMonth) {
          finalMonths[month] += 1;
        }
      });
    });
  
    const monthlySalesRecord = [];
  
    Object.keys(finalMonths).forEach((monthName) => {
      monthlySalesRecord.push(finalMonths[monthName]);
    });
  
    res.status(200).json({
      success: true,
      message: 'All payments',
      allPayments,
      finalMonths,
      monthlySalesRecord,
    });
  };



  export{getRazorpayApiKey,buySubscription,verifySubscription,cancelSubscription,allPayments}
 

  
  