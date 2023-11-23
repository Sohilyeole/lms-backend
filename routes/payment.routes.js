import{Router} from"express";

const router=Router();
import { getRazorpayApiKey,buySubscription,verifySubscription,cancelSubscription,allPayments } from "../controllers/payment.controller.js";
// import { authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import {isLoggedIn,authorizedRoles,authorizedSubscriber} from "../middlewares/auth.middleware.js";
// router.route("/razorpay-key").get(isLoggedIn,getRazorpayApiKey);
// router.route("/subscribe")
// .post(isLoggedIn,buySubscription);
router.route("/verify").post(isLoggedIn,verifySubscription);
router.route("/unsubscribe").post(isLoggedIn,cancelSubscription);
router.route("/").get(isLoggedIn,authorizedRoles('ADMIN'),allPayments);

router.route("/razorpay-key")
.get(isLoggedIn,getRazorpayApiKey)
router.route("/subscribe")
.post(isLoggedIn,buySubscription)


// .post(isLoggedIn,authorizedRoles('ADMIN'),upload.single('thumbnail'),createCourse)
export default router;
