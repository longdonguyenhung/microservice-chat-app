import express from "express"
import { groupForming, groupMapping } from "../controller/groupMapping.js";

const router = express.Router();

router.get("/group", groupMapping);
router.post("/group", groupForming);

export default router;