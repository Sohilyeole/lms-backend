import { Schema, model } from 'mongoose';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import crypto from "crypto";

const userSchema=new Schema({
 fullName:{
    type:"String",
    required:[true,"name is require"],
    minLength:[5,"name must be at leat 5 char"],
    maxLength:[50,"name should be less than 50 char"],
    lowercase:true,
    trim:true,

 },
 email:{
    type:"String",
    required:[true,"email is require"],
    lowercase:true,
    trim:true,
    unique:true,
    match:[
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please fill in a valid email address',
      ],
 },
 password:{
    type:"String",
    required:[true,"password is require"],
    minLength:[8,"password must be at least 8 character"],
    select:false,
 },
 avtar:{
    public_id:{
        type:"String"
    },
    secure_url:{
        type:"String"
    }

 },
 role:{
   type:"String",
   enum:["USER","ADMIN"],
   default:"USER"
 },
 forgotPasswordToken:{
    type:"String"
 },
 forgotPasswordExpiry:{
    type:"Date"
 },
 subsciprtion:{
   id:{
    type:"String"
   },
   status:{
    type:"String"
   }
 }


},{
    timestamps:true
});
userSchema.pre("save", async function  (next){
    if(!this.isModified("password")){
        return next();
    }
    this.password= await bcrypt.hash(this.password,10);
})
userSchema.methods={
    generateJWTToken: async function(){
        return  await jwt.sign({
            id: this._id,
            email:this.email,
            subsciprtion:this.subsciprtion,
            role:this.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn:process.env.JWT_EXPIRY,
        })
    },
    comparePassword: async function(plainTextPassword){
        return await bcrypt.compare(plainTextPassword,this.password)

    },
    genratePasswordResetToken: async  function() {
        const resetToken=crypto.randomBytes(20).toString('hex');
        this.forgotPasswordToken=crypto
        .createHash('sha256')
        .update(resetToken)
        .digest("hex")
        
        this.forgotPasswordExpiry=Date.now()+15*60*1000; //15 min from now
        return resetToken;

    }
}
const User=model("User",userSchema)

export default User;