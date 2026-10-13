import connectDB from "./db/index.js"
import "dotenv/config";
import dns from 'dns'
import app from "./app.js"

dns.setServers(["1.1.1.1", "8.8.8.8"])

const PORT = process.env.PORT || 8000

connectDB()
    .then(() => {
        app.listen( PORT, () => {
            console.log(`⚙️  Server is running at port : ${ PORT}`);
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })
