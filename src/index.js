import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
import { refreshAccessToken } from "./controllers/user.controllers.js";

const a_test = refreshAccessToken()
console.log(a_test);


dotenv.config({ path: "./.env" });


connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`The server is listening to the port ${process.env.PORT}`);
    });
  })
  
  .catch((err) => {
    console.log("There is an error !!!", err);
  });

/* import express from "express";
const app = express()

(async ()=>
    {
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

            app.on()

            app.listen(process.env.PORT, ()=>{
                console.log("The db id listening to port: ",process.env.PORT); 
            })
        } catch (error) {
            console.log("The error is: ",error);
            throw err
        }
    }
)(

) */
