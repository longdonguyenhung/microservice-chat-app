import express from "express";
import { receiveMessage } from "../create_gateway.js";

const router = express.Router();

router.post("/get_user", receiveMessage);

export default router;