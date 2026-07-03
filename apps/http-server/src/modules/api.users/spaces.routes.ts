import express from "express";
import prisma from "@repo/db";
import jwt from "jsonwebtoken";

const userRouter = express.Router();


const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";


userRouter.post("/signup", async (req: express.Request, res: express.Response) => {
    try {
        const { email, displayName, password } = req.body;

        
        if (!email || !displayName || !password) {
            return res.status(400).json({
                error: "Missing required fields. Please provide email, displayName, and password."
            });
        }

        
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({
                error: "A user with this email already exists."
            });
        }

        
        const newUser = await prisma.user.create({
            data: {
                email,
                displayName,
                password, 
            }
        });

        
        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: "7d" });

        
        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                displayName: newUser.displayName,
                avatarSkin: newUser.avatarSkin
            }
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: "An internal server error occurred during signup." });
    }
});


userRouter.post("/signin", async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;

        
        if (!email || !password) {
            return res.status(400).json({
                error: "Missing required fields. Please provide email and password."
            });
        }

        
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        
        if (password !== user.password) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

        
        res.status(200).json({
            message: "Signed in successfully",
            token,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                avatarSkin: user.avatarSkin
            }
        });

    } catch (error) {
        console.error("Signin Error:", error);
        res.status(500).json({ error: "An internal server error occurred during signin." });
    }
});

export default userRouter;