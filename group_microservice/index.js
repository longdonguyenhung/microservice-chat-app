import express from "express"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import dotenv from 'dotenv'
import cors from "cors"
import http from "http"
import router from "./router/index.js"


//app config
const app = express();
dotenv.config();
const port = process.env.PORT

const corsOptions = {
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
}
app.use(cors(corsOptions))

//middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
const server = http.createServer(app)

//DB config
const uri = "mongodb://localhost:27017/test"; //this would be a separate database, at least for development mode, it will be switch to another database 
// in different cluster later


try {
    await mongoose.connect(uri);
    console.log("Connected with Mongodb")
  } catch (error) {
    console.log(error);
    console.log("No connected with Mongodb")
  }

//router
app.use(router)

server.listen(8084, () => {
    console.log("Hi port:" + port)
})

//so in reality we should use a mechanism to distribute with many app instance 
//so now we have to do the two other thing, first is create a server to store information about room, chat
//support query to find the data
//we also need to support video chat, in different media
//load balancer and other message queue is add
//we also need to measure and stress test and load test
//This architecture is also lack of authenticiation
