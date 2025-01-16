import express from "express";
import { registerController, loginController, searchUser, userDetails } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js";

const router = express.Router();

// Register route
router.post("/register", upload.single("avatar"), registerController);
router.post("/",loginController);
router.get("/searchUser",searchUser);
router.get("/fetchDetails",userDetails);

export default router;
