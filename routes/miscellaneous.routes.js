// import { Router } from 'express';
import { Router } from 'express';
// import {
//   contactUs,
//   userStats,
// } from '../controllers/miscellaneous.controller.js';
// import userStats from '../controllers/miscellaneous.controller';
// import { authorizedRoles, isLoggedIn } from '../middlewares/auth.middleware.js';
// import { authorizedRoles, isLoggedIn} from '../middlewares/auth.middleware';
import  {isLoggedIn,authorizedRoles } from '../middlewares/auth.middleware.js';
import userStats from '../controllers/miscellaneous.controller.js';


const router = Router();

// {{URL}}/api/v1/
// router.route('/contact').post(contactUs);
router
  .route("/admin/stats/users")
  .get(isLoggedIn,authorizedRoles('ADMIN'), userStats);

export default router;
