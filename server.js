
import app from "./app.js"

import connectionToDb from "./config/db.Connection.js"
import Razorpay from "razorpay"


const port=parseInt(process.env.PORT) || 5080

 
import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key:process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const razorpay=new Razorpay({
  key_id:"rzp_test_HXnQ1qzQqHUF0V",
  key_secret:"pXpFDMS7ds28bBNhn3ziVWxK"
})
// console.log(razorpay)
app.listen(port, async ()=>{
    await connectionToDb();
    console.log(`App is running at Http:localhost:${port}`)
})
export default razorpay