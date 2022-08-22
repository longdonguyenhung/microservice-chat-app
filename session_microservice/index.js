import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import router from "./route/index.js";

//app config
const app = express();
dotenv.config();
const port = process.env.PORT;

const corsOptions = {
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const server = http.createServer(app);

//DB config
const uri =
  "mongodb+srv://longdonguyenhung:hunglong123@cluster0.kvko1.mongodb.net/test";
// "mongodb://localhost:27017/test" || "mongodb+srv://longdonguyenhung:hunglong123@cluster0.kvko1.mongodb.net/?retryWrites=true&w=majority";

const connString = process.env.MONGODB_CONNSTRING;
console.log("update");

try {
  await mongoose.connect(uri);
  console.log("Connected with Mongodb");
} catch (error) {
  console.log(error);
  console.log("No connected with Mongodb");
}

//router
app.use(router);

server.listen(8083, () => {
  // console.log("Hi port:" + port);
  console.log(`Hi port: ${8083}`);
});
