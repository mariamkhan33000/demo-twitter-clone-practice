import mongoose from "mongoose";
import color from "color";
import colors from 'colors'
const connectedDb = async () => {
    try {
        await mongoose.connect(process.env.LOCAL_MONGOOSE)
        console.log(`The Mongodb is connected at ${mongoose.connection.host}`.bgBlue)
    } catch (error) {
        console.log(`Error connection to Mongodb : ${error.message}`.bgRed)

    }
} 

export default connectedDb