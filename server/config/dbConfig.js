import express from "express"
import mongoose from "mongoose"



const connectDb = async()=>{

    try {

        const conn = await mongoose.connect(process.env.MONGODB_URI)
        // console.log(conn)
        console.log(`DB CONNECTED SUCCESSFULY : ${conn.connection.name}`.bgGreen.black)
        
    } catch (error) {
        console.log(`Db Server Failed : ${error.message}`.bgRed)
    }
}


export default connectDb