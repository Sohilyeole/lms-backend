import express from "express";
import cors from"cors";
import morgan from "morgan"
import cookieParser from"cookie-parser";
import userRoutes from "./routes/user.routes.js"
import courseRoutes from "./routes/course.route.js"
import paymentRoutes from "./routes/payment.routes.js"
import errorMiddleware from "./middlewares/error.middleware.js";
import bodyParser from "body-parser";
import miscRoutes from "./routes/miscellaneous.routes.js"



import {config}from"dotenv";
config();
const app=express();
app.use(bodyParser.json())


app.use(express.json())

app.use(cors({
    origin:[process.env.FRONTEND_URL], 
    credentials:true
}));

app.use(cookieParser());
app.use(morgan('dev'));

app.use(express.urlencoded({ extended: true }));
app.use("/ping",(req,res)=>{
    res.send("pong")
})

// routes of 3 main module
app.use("/api/v1/user",userRoutes);
app.use("/api/v1/courses",courseRoutes);
app.use("/api/v1/payments",paymentRoutes);
app.use('/api/v1', miscRoutes);
app.all("*",(req,res)=>{
    res.status(404).send("OPPS!! 404 page not found")
})
app.use(errorMiddleware);
export default app;