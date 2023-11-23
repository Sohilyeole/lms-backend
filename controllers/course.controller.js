//  import { findById } from "moongose/models/user_model.js";
import Course from "../models/course.model.js";
import AppError from "../utils/error.utlil.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
 
 const getAllCourses=async(req,res,next)=>{
    try {
        const courses=await Course.find({}).select('-lectures');
   res.status(200).json({
    sucess:true,
    message:"All Course",
    courses
   })
    } catch (error) {
        return next(new AppError(error.message,400))
    }
   
 }
 const getLecturesByCourseId=async(req,res,next)=>{
  try {
    console.log("sabbdbbzbbia")
    const {id}=req.params;
    const course=await Course.findById(id);
    if(!course){
        return next(new AppError("course are invalid",500))
    }
    res.status(201).json({
        sucess:true,
        message:"Course lectured fetched sucessfully",
        lectures:course.lectures
    })
  } catch (error) {
    return next(new AppError(error.message,500))
  }
 }
 const createCourse=async(req,res,next)=>{
 const {title,description,category,createdBy}=req.body;
 if(!title ||!description ||!category||!createdBy){
    return next(new AppError("All feild are required",400))
 }
 try {
    console.log("in try")
    const course=await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail:{
            public_id:"dumy",
            secure_url:"dumy"
        }
     });
     console.log(course)
     if(!course){
        return next(new AppError("course could not be craeted",400))
     }
    
     if(req.file){
        const result=await cloudinary.v2.uploader.upload(req.file.path,{
            folder:'lms'
        })
        console.log(result)
    
        if(result){
            course.thumbnail.public_id=result.public_id;
            course.thumbnail.secure_url=result.secure_url;
        }
       fs.rm(`uploads/${req.file.filename}`)
     }
     await course.save();
  res.status(201).json({
    sucess:true,
    message:"Course created sucessfully",
    course,
  })
 } catch (error) {
    return next(new AppError(error.message,500))
 }
 
  





 }
 const updateCourse=async (req,res,next)=>{
 try {
  const {id}=req.params;
  console.log(id);
  const course=await Course.findByIdAndUpdate(
    id,{
      $set:req.body
    },
    {
      runValidators:true
    }
  )
  console.log(course)
  if(!course){
    return next(new AppError("course with given id doesnot exists",500))
  }
  res.status(200).json({
    sucess:true,
    message:"course updated sucessfully",
    course
  })
  
    } catch (error) {
      return next(new AppError(error.message,500))
    }




 }
 const removeCourse=async(req,res,next)=>{
try {
  const {id}=req.params;
  const course=await Course.findById(id)
  if(!course){
    return next(new AppError("course not exist",500))
  }
  await Course.findByIdAndDelete(id);
  res.status(201).json({
    sucess:true,
    message:"Course deleted sucessfully"
  })
  
} catch (error) {
  return next(new AppError(error.message,500))
}
 }
 const addLectureToCourseById=async(req,res,next)=>{
  console.log("in aadd lecture")
  const {title,description}=req.body;
  if(!title||!description){
    return next(new AppError("all feild are rquire",400))
  }
  const{id}=req.params;
  console.log(id)
  const course=await Course.findById(id);
  if(!course){
    return next(new AppError("course not find",400))
  }
  const lectureData={
    title,
    description,
    lecture:{}
  }
  if(req.file){
    try {
      const result=await cloudinary.v2.uploader.upload(req.file.path,{
        folder:'lms',
        chunk_size:50000000,//50 mb
        resource_type:'video',
    })
    console.log(result)
    

    if(result){
       lectureData.lecture.public_id=result.public_id;
        lectureData.lecture.secure_url=result.secure_url;
    }
   fs.rm(`uploads/${req.file.filename}`)
   
   course.lectures.push(lectureData)
   
   course.numberOfLectures=course.lectures.length
   await course.save();
   res.status(201).json({
     sucess:true,
     message:"lecture added",
     course
   })
    } catch (error) {
      console.log(error.message)
      return next(new AppError(error.message,500))
      
    }
  }

 }

const removeLectureFromCourse=async(req,res,next)=>{
  const { courseId, lectureId } = req.query;


  console.log(courseId);

  // Checking if both courseId and lectureId are present
  if (!courseId) {
    return next(new AppError('Course ID is required', 400));
  }

  if (!lectureId) {
    return next(new AppError('Lecture ID is required', 400));
  }

  // Find the course uding the courseId
  const course = await Course.findById(courseId);

  // If no course send custom message
  if (!course) {
    return next(new AppError('Invalid ID or Course does not exist.', 404));
  }

  // Find the index of the lecture using the lectureId
  const lectureIndex = course.lectures.findIndex(
    (lecture) => lecture._id.toString() === lectureId.toString()
  );

  // If returned index is -1 then send error as mentioned below
  if (lectureIndex === -1) {
    return next(new AppError('Lecture does not exist.', 404));
  }

  // Delete the lecture from cloudinary
  await cloudinary.v2.uploader.destroy(
    course.lectures[lectureIndex].lecture.public_id,
    {
      resource_type: 'video',
    }
  );

  // Remove the lecture from the array
  course.lectures.splice(lectureIndex, 1);

  // update the number of lectures based on lectres array length
  course.numberOfLectures = course.lectures.length;

  // Save the course object
  await course.save();

  // Return response
  res.status(200).json({
    success: true,
    message: 'Course lecture removed successfully',
  });

}
 
 export{
    getAllCourses,getLecturesByCourseId,createCourse,updateCourse,removeCourse,addLectureToCourseById,removeLectureFromCourse
 }