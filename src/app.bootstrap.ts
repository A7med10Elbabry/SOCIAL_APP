import express, {type Request, type Response} from "express"
import { authRouter } from "./modules"
import cors from "cors"
import { globalErrorHandler } from "./middleware"
import { PORT } from "./config/config"
import connectDB from "./DB/connection.db"
import { redisService } from "./common/service"
import { userRouter } from "./modules/user"



export const bootstrap = async () => {

const app = express()

// global middlewares
app.use(cors(),express.json())

// base routing
app.get("/", (req:Request, res:Response) => {
    res.json({ message: "Hello World" })
})
// application routing

app.use("/auth", authRouter)
app.use("/user", userRouter)
// invalid routing handling
app.use("/*dummy",(req:Request, res:Response) => {
    res.status(404).json({ message: "page not found" })
}) 

// global error handling
app.use(globalErrorHandler)
// DB
    await connectDB()
    await redisService.connect()
app.listen(PORT, () => {
    
    console.log(`Server is running on port ${PORT}`)
})

}