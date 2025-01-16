import express from "express"
import authRoute from "./routes/auth.routes.js"
import postRoute from "./routes/post.routes.js"
import friendRoute from "./routes/friends.routes.js"
import messageRoute from "./routes/message.routes.js"
import cors from "cors"
const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoute);
app.use("/posts", postRoute);
app.use("/friends",friendRoute);
app.use("/message",messageRoute);

export default app; 