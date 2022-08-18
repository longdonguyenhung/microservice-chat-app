import express from "express"
import { addUserToChat, createGroup, groupForming, groupMapping } from "../controller/groupMapping.js";
import { isRoomExist } from "../middleware/roomValidation.js";

const router = express.Router();

router.get("/group", groupMapping);
router.post("/group", groupForming);
router.post("/add_chat", isRoomExist, addUserToChat);
router.post("/create_group",createGroup);

export default router;