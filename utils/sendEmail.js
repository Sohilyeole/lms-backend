import nodemailer from "nodemailer";
console.log("in utils")
// import Mailgen from "mailgen"

// async..await is not allowed in global scope, must use a wrapper
// const sendEmail = async function (email, subject, message) {
//     try {const  transporter = nodemailer.createTransport({
    
//       // host: process.env.SMTP_HOST,
//       // port: process.env.SMTP_PORT,
//       service:"gmail",
//       secure: false, // true for 465, false for other ports
//       auth: {
//         user: 'enoch37@ethereal.email',
//         pass: 'nBw2VBVWEA1kY7bYwS'
//       },
//     });
//     console.log("fgh")
    
  
//     // send mail with defined transport object
  
    
//       await transporter.sendMail({
     
//           // from: process.env.SMTP_FROM_EMAIL, 
//           from:"sohil.yeole21@pccoepune.org", // sender address
//           to: email, // user email
//           subject: subject, // Subject line
//           text: message, // html body
//         },(error,info)=>{
//           if(error){
//           console.log(error)}
//           else{
//             console.log(info)
//           }

//         });
//         console.log("right")
    
      
//     } catch (error) {
//       console.log(error.message)
//     }
//    console.log("in main")
//   // create reusable transporter object using the default SMTP transport
  

// };
 const sendEmail=(email,subject,message)=>{
  // const  userEmail  = "yeolesohil44@gmail.com"

  let config = {
      service : 'gmail',
      auth : {
          user: process.env.SMTP_FROM_EMAIL,
          pass: process.env.SMTP_PASSWORD
      }
  }

  let transporter = nodemailer.createTransport(config);
  let messageData = {
      from:"fakedummy848@gmail.com",//actually not needed
      to : email,
      subject:subject,
      html: message
  }

  transporter.sendMail(messageData).then(() => {
      return console.log("sucessfully send")
          
      })
  .catch(error => {
      return console.log(error.message)
  })

 }
export default sendEmail;



// import nodemailer from "nodemailer";

// // async..await is not allowed in global scope, must use a wrapper
// const sendEmail = async function (email, subject, message) {
//   // create reusable transporter object using the default SMTP transport
//   let transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: process.env.SMTP_USERNAME,
//       pass: process.env.SMTP_PASSWORD,
//     },
//   });

//   // send mail with defined transport object
//   await transporter.sendMail({
//     from: process.env.SMTP_FROM_EMAIL, // sender address
//     to: email, // user email
//     subject: subject, // Subject line
//     html: message, // html body
//   });
// };

// export default sendEmail;