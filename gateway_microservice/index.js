import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
import cors from "cors";
import http from "http";
import router from "./router/index.js";
import { createConnection } from "./create_gateway.js";


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
const url = process.env.url_Mongoodb;

//router
app.use(router)

server.listen(8081, () => {
    console.log("Hi port:" + port)
})

try{
  await createConnection();
  console.log("create a websocketserver");
} catch(error) {
  console.log(error);
  console.log("No connection to websocket");
}

