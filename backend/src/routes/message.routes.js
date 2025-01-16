import express from "express"
import { getMessages, sendMessage, createRoom } from "../controllers/message.controllers.js";
const router = express.Router();
router.post("/send",sendMessage);
router.get("/messages/:room",getMessages);
router.post("/create",createRoom);
export default router;