import {Router} from "express";
const router=Router();
import{getAllCourses,getLecturesByCourseId,createCourse,updateCourse,removeCourse,addLectureToCourseById,removeLectureFromCourse}from "../controllers/course.controller.js"
import {isLoggedIn,authorizedRoles,authorizedSubscriber} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
// router.get("/",getAllCourses); same as below 
router.route("/")
.get(getAllCourses)
.post(isLoggedIn,authorizedRoles('ADMIN'),upload.single('thumbnail'),createCourse)
.delete(isLoggedIn,authorizedRoles("ADMIN"),removeLectureFromCourse)
// router.get("/:id",getLecturesByCourseId);
router.route("/:id")
.get(isLoggedIn,authorizedSubscriber,getLecturesByCourseId)
.put(isLoggedIn,updateCourse)
.delete(isLoggedIn,authorizedRoles("ADMIN"),removeCourse)
.post(isLoggedIn,authorizedRoles("ADMIN"),upload.single("lecture"),addLectureToCourseById)

//acess like that in sampleid write object id //localhost:3180/api/v1/courses/sampleexamplid
export default router;
