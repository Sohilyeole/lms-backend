import AppError from "../utils/error.utlil.js";
import User from "../models/user.model.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

const cookieOptions = {
   maxAge: 7 * 24 * 60 * 60 * 1000,
   // httpOnly: true,
   secure: true,
   sameSite: 'None'
};

const register = async (req, res, next) => {
  
   
   const { fullName, email, password } = req.body;
   console.log(fullName , email,  password)
   if (!fullName || !email || !password) {
      return next(new AppError("all feilds are require", 400));
   }
   const userExists = await User.findOne({ email: email });
   if (userExists) {
      return next(new AppError("email already exist", 400));
   }
   const user = await User.create({
      fullName,
      email,
      password,
      avtar: {
         public_id: email,
         secure_url: "https://www.w3.org/Provider/Style/dummy.html",
      },
      forgotPasswordToken:"",
      subsciprtion:{
         id:"123",
         status:"active",
       }

   });
   if (!user) {
      return next(new AppError("user registration fail ,please try again", 400));
   }
   //TODO :file upload
  console.log("sohil",req.file)
   if (req.file) {

      try { 
         console.log("in try")
         const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: "lms", // Save files in a folder named lms
            width: 250,
            height: 250,
            gravity: "faces", // This option tells cloudinary to center the image around detected faces (if any) after cropping or resizing the original image
            crop: "fill",
         });

         if (result) {
            user.avtar.public_id = result.public_id;
            user.avtar.secure_url = result.secure_url;
            //remove file from local server
            fs.rm(`uploads/${req.file.filename}`);
         }
      } catch (error) {
         return new AppError(error || "file not uploded,please try again", 500);
      }
   }
   await user.save();
   user.password = undefined;

   const token = await user.generateJWTToken();
   res.cookie("token", token, cookieOptions);

   res.status(201).json({
      sucess: true,
      message: "User register sucessfully",
      user,
     
   });
   console.log(user)
};
const login = async (req, res, next) => {
   try {
      const { email, password } = req.body;
      console.log(email,password)
      if (!email || !password) {
         return next(new AppError("all feilfd are require", 400));
      }
      const user = await User.findOne({ email }).select("+password");
      if (!user || !user.comparePassword(password)) {
         return next(new AppError(" Email or password does not match", 400));
      }
      const token = await user.generateJWTToken();
      user.password = undefined;
      res.cookie("token", token, cookieOptions);
      

      res.status(200).json({
         sucess: true,
         message: "user loggedin sucessfully",
         user,
      });
   } catch (error) {
      return next(new AppError(error.message, 600));
   }
};
const logout = (req, res) => {
   res.cookie("token", null, {
      secure: true,
      maxAge: 0,
      httpOnly: true,
   });
   res.status(200).json({
      sucess: true,
      message: "User logged out suceesfully",
   });
};
const getProfile = async (req, res, next) => {
   try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      res.status(200).json({
         sucess: true,
         message: "user deetails",
         user,
      });
   } catch (error) {
      return next(new AppError("failed to fetch userdetail", 400));
   }
};
const forgotPassword = async (req, res, next) => {
   const { email } = req.body;
   if (!email) {
      return next(new AppError("Email is required", 400));
   }
   const user = await User.findOne({ email });
   if (!user) {
      return next(new AppError("Email is not register", 400));
   }
   const resetToken = await user.genratePasswordResetToken();

   await user.save();
   console.log(process.env.FRONTEND_URL);
   const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset/${resetToken}`;
   console.log(resetPasswordUrl);

   const subject = "Reset Password";
   const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;

   try {
      await sendEmail(email, subject, message);
      res.status(200).json({
         sucess: true,
         message: `reset password token has sent to ${email}`,
      });
   } catch (error) {
      user.forgotPasswordExpiry = undefined;
      user.forgotPasswordToken = undefined;
      await user.save();
      return next(new AppError(error.message, 600));
   }
};
const resetPassword = async (req, res, next) => {
   const { resetToken } = req.params;
   const { password } = req.body;
   const forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
   const user = await User.findOne({
      forgotPasswordToken,
      forgotPasswordExpiry: { $gt: Date.now() },
   });
   if (!user) {
      return next(new AppError("token is invalid or expired", 400));
   }
   user.password = password;
   user.forgotPasswordToken = undefined;
   user.forgotPasswordExpiry = undefined;
   user.save();
   res.status(201).json({
      sucess: true,
      message: "your password change suceesfully",
   });
};
const changePassword = async (req, res, next) => {
   console.log("hhhhh");
   const { oldPassword, newPassword } = req.body;
   const { id } = req.user;

   if (!oldPassword || !newPassword) {
      return next(new AppError("all feilds are require", 400));
   }

   const user = await User.findById(id).select("+password");
   if (!user) {
      return next(new AppError("user does not exist", 400));
   }
   user.password = newPassword;
   await user.save();
   user.password = undefined;
   res.status(201).json({
      sucess: true,
      message: "password changed sucessfully",
   });
};
const updateUser = async (req, res, next) => {
   console.log("in main function");
   const { fullName } = req.body;
   
   const { id } = req.user; //user include id so its capture {id } from user object so we not reequire to write req.user.id

   const user = await User.findById(id);
 

   if (!user) {
      return next(new AppError("user not exist", 400));
   }
   if (fullName) {
     
      user.fullName = fullName;
   }
   if (req.file) {
      await cloudinary.v2.uploader.destroy(user.avtar.public_id);
      try {
         const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: "lms", // Save files in a folder named lms
            width: 250,
            height: 250,
            gravity: "faces", // This option tells cloudinary to center the image around detected faces (if any) after cropping or resizing the original image
            crop: "fill",
         });

         if (result) {
            user.avtar.public_id = result.public_id;
            user.avtar.secure_url = result.secure_url;
            //remove file from local server
            fs.rm(`uploads/${req.file.filename}`);
         }
      } catch (error) {
         return new AppError(error || "file not uploded,please try again", 600);
      }
   }
   await user.save();
   
   res.status(201).json({
      sucess: true,
      message: "User details updated sucessffully",
   });
};

export {
   register,
   login,
   logout,
   getProfile,
   forgotPassword,
   resetPassword,
   changePassword,
   updateUser,
};
