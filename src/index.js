//euire('dotenv').config({path: './env'});

//import mongoose from "mongoose"
//import {DB_NAME} from "./constants"

import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({

  path:'./.env'
})

connectDB()
.then(()=>{
  app.listen(process.env.PORT || 8000,()=>{
    console.log(`server  is runing ata port: ${process.env.PORT}`)
  })
})
.catch((err)=>{
  console.log("Mongo db connection failed",err);
})

   /* as it is a second method as in that we not create another file like create in db as Index.js as write all the content here
    await  mongoose.connect(`$(process.env.MONGODB_URL)/${DB_NAME}`)
      app.on("error",(error)=>{
        console.log("ERROR:",error);
        throw error

      })
    app.listen(process.env.PORT,()=>{
        console.log(`app is listening on port
             ${process.env.PORT}`);
    })

    } catch (error) {
        console.error("ERROR:",error)
    
        throw err
        
    }
})()*/
//important for databse alway learn
// as in database learn a statement that database in othere contienent
//  so we user async await and try catch in database to connnect 
// its give very much error so we use try catch