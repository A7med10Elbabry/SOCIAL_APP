import express, {type Request, type Response} from "express"
import { authRouter } from "./modules"
import cors from "cors"
import { globalErrorHandler } from "./middleware"
import { PORT } from "./config/config"
import connectDB from "./DB/connection.db"
import { redisService, s3Service } from "./common/service"
import { userRouter } from "./modules/user"
import { successResponse } from "./common/response"
import { pipeline } from "node:stream"
import { promisify } from "node:util"


const s3WriteStream = promisify(pipeline)

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
app.get("/uploads/*path", async (req:Request, res:Response) => {
    const {download, fileName} = req.query as {download?: string, fileName?: string}
    const {path} = req.params as {path: string[]}
    const Key = path.join("/")
    const {Body, ContentType} = await s3Service.getAsset({Key})
     res.setHeader(
      "Content-Type",
      ContentType || "application/octet-stream"
    );
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    if (download === "true") {
        res.setHeader("Content-Disposition", `attachment; filename="${fileName || Key.split("/").pop()}"`); // only apply it for  download
    }
    return await s3WriteStream(Body as NodeJS.ReadableStream,res)
})

app.get("/presigned/*path", async (req:Request, res:Response) => {
    const {download, fileName} = req.query as {download: string, fileName: string}
    const {path} = req.params as {path: string[]}
    const Key = path.join("/")
    const url = await s3Service.createPresignedFetchLink({Key, download, fileName})
    return successResponse({res, data:{url}})
})
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