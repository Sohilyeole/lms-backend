import {Router} from "express"
import{register,login,logout,getProfile,forgotPassword,resetPassword,changePassword,updateUser} from "../controllers/user.controller.js"
import {isLoggedIn} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
const router=Router();
router.post("/register", upload.single("avatar"),register);
//  router.post("/register", register);

router.post("/login",login);
router.get("/logout",isLoggedIn,logout);
router.get("/me",isLoggedIn,getProfile);
router.post("/reset",forgotPassword);
router.post("/reset/:resetToken",resetPassword);
router.post("/change-password",isLoggedIn,changePassword)
router.put("/update/:_id",isLoggedIn,upload.single("avatar"),updateUser)
export default router;