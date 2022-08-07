import express from "express"
import { updateConnection, userMapping } from "../controller/user_mapping.js";

const router = express.Router();

router.get("/session", userMapping);
router.post("/session", updateConnection);

export default router;