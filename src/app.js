import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" })); // this is used to acccept and work on the data coming in json format
app.use(express.urlencoded({extended: true, limit: '16kb'}))
app.use(express.static("public"))
app.use(cookieParser())


// router import
import userRouter from router
import { router } from "./routes/user.routes.js";

app.use("/users", userRouter )


export default app;
