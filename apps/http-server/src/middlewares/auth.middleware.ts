import express from "express";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";


declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

const authMiddleware = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        
        const authHeader = req.headers.authorization;

        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Unauthorized: Missing or improperly formatted token."
            });
        }

        
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                error: "Unauthorized: Token not found."
            });
        }

        
        const decoded = jwt.verify(token, JWT_SECRET);

        
        req.user = decoded;

        
        next();

    } catch (error) {
        
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: "Unauthorized: Token has expired." });
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ error: "Forbidden: Invalid token." });
        }

        
        console.error("Auth Middleware Error:", error);
        return res.status(500).json({ error: "Internal server error during authentication." });
    }
};

export default authMiddleware;