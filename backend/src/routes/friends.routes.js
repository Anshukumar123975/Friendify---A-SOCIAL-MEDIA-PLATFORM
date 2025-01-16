import express from "express"
import { sendRequestSent, showRequest, acceptRequest, allFriends } from "../controllers/friends.controller.js";
import { authenticateUser } from '../middlewares/jwt.middlewares.js';
const router = express.Router();
router.post("/send",authenticateUser,sendRequestSent);
router.get("/show",authenticateUser,showRequest);
router.put("/accept",acceptRequest);
router.get("/",authenticateUser,allFriends);
export default router;