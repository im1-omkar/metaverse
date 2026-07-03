import express from "express";
import cors from "cors"
import userRouter from "./src/modules/api.users/spaces.routes";

const PORT = 3000;
const app = express()

app.use(express.json())
app.use(cors())

app.use("/api/users",userRouter)

app.listen(PORT,()=>{
    console.log("server is running on port "+PORT)
})
