import express from "express"
import cookieparser from "cookie-parser"
import cors from "cors"


const app = express();
app.use(cors({
    origin : process.env.CORS_ALLOWED,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true})) // it is used to accept url in form of rishabh+raj or rishabh%20raj
app.use(express.static("public"))
app.use(cookieparser())

import userRouter from "./routes/user.routes.js";
import videoRouter from './routes/video.routes.js'
import likeRouter from './routes/like.routes.js'
import commentRouter from './routes/comment.routes.js'
import suscriberRouter from './routes/subscription.routes.js'
import viewRouter from './routes/view.routes.js'
import dashboardrouter from './routes/dashboard.routes.js'
import playlistrouter from './routes/playlist.routes.js'

app.use("/api/v1/user" , userRouter);
app.use("/api/v1/video" , videoRouter);
app.use("/api/v1/like" , likeRouter);
app.use("/api/v1/comment" , commentRouter);
app.use("/api/v1/subscribe" , suscriberRouter)
app.use("/api/v1/view" , viewRouter)
app.use("/api/v1/dashboard" , dashboardrouter)
app.use("/api/v1/playlist" , playlistrouter)


export default app