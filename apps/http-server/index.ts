import express from "express";
import cors from "cors"
import userRouter from "./src/modules/api.users/spaces.routes";

const PORT = process.env.PORT || 3001;
const app = express()

app.use(express.json())
app.use(cors({ origin: process.env.FRONTEND_URL }));

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});

//users router
app.use("/api/users",userRouter)

//spaces router is about to be added

//global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT,()=>{
    console.log("server is running on port "+PORT)
})
