import { connect } from "mongoose"
import { DB_URI } from "../config/config"



const connectDB = async () => {
    try {
        await connect(DB_URI)
        console.log("DB connected successfully")
    }catch (error) {
        console.log("failed to connect DB");
    }
}

export default connectDB