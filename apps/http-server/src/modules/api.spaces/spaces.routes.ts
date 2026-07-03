import express from "express";
import prisma from "@repo/db";
import authMiddleware from "../../middlewares/auth.middleware"; 

const spaceRouter = express.Router();


interface AuthRequest extends express.Request {
    user?: {
        userId: string;
        [key: string]: any;
    };
}


spaceRouter.get("/", async (req: express.Request, res: express.Response) => {
    try {
        const spaces = await prisma.space.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                width: true,
                height: true,
                createdAt: true,
                creator: {
                    select: {
                        displayName: true
                    }
                }
            }
        });

        res.status(200).json(spaces);
    } catch (error) {
        console.error("Error fetching spaces:", error);
        res.status(500).json({ error: "Failed to fetch spaces." });
    }
});



spaceRouter.post("/", authMiddleware, async (req: AuthRequest, res: express.Response) => {
    try {
        const { name, description, width = 32, height = 32 } = req.body;
        
        
        if (!req.user || !req.user.userId) {
            res.status(401).json({ error: "Unauthorized." });
            return;
        }
        
        const userId = req.user.userId;

        if (!name) {
            res.status(400).json({ error: "Space name is required." });
            return;
        }

        const defaultMapData = {
            tiles: Array(height).fill(Array(width).fill(0))
        };

        const newSpace = await prisma.space.create({
            data: {
                name,
                description,
                width,
                height,
                mapData: defaultMapData,
                creatorId: userId,
                spawnX: 0,
                spawnY: 0
            }
        });

        res.status(201).json({
            message: "Space created successfully",
            space: newSpace
        });
    } catch (error) {
        console.error("Error creating space:", error);
        res.status(500).json({ error: "Failed to create space." });
    }
});


spaceRouter.get("/:spaceId", async (req: express.Request, res: express.Response) => {
    try {
        const spaceId =
            typeof req.params.spaceId === "string"
                ? req.params.spaceId
                : undefined;

        if (!spaceId) {
            res.status(400).json({ error: "Space ID is required." });
            return;
        }

        const space = await prisma.space.findUnique({
            where: { id: spaceId },
            include: {
                objects: true, 
                creator: {
                    select: { displayName: true }
                }
            }
        });

        if (!space) {
            res.status(404).json({ error: "Space not found." });
            return;
        }

        res.status(200).json(space);
    } catch (error) {
        console.error("Error fetching specific space:", error);
        res.status(500).json({ error: "Failed to fetch space details." });
    }
});


spaceRouter.post("/:spaceId/objects", authMiddleware, async (req: AuthRequest, res: express.Response) => {
    try {
        const spaceId = req.params.spaceId as string;
        const { x, y, type, payload } = req.body;

        if (x === undefined || y === undefined || !type) {
            res.status(400).json({ error: "Missing required fields: x, y, and type are required." });
            return;
        }

        const spaceExists = await prisma.space.findUnique({
            where: { id: spaceId }
        });

        if (!spaceExists) {
            res.status(404).json({ error: "Space not found. Cannot add object." });
            return;
        }

        const newObject = await prisma.interactiveObject.create({
            data: {
                spaceId,
                x: Number(x),
                y: Number(y),
                type,
                payload: payload || null
            }
        });

        res.status(201).json({
            message: "Interactive object added successfully",
            object: newObject
        });
    } catch (error) {
        console.error("Error adding object to space:", error);
        res.status(500).json({ error: "Failed to add object." });
    }
});


spaceRouter.put("/objects/:objectId", authMiddleware, async (req: AuthRequest, res: express.Response) => {
    try {
        const objectId = req.params.objectId as string;
        const { x, y, type, payload } = req.body;

        if (!objectId) {
            res.status(400).json({ error: "Object ID is required." });
            return;
        }

        const existingObject = await prisma.interactiveObject.findUnique({
            where: { id: objectId }
        });

        if (!existingObject) {
            res.status(404).json({ error: "Interactive object not found." });
            return;
        }

        const updatedObject = await prisma.interactiveObject.update({
            where: { id: objectId },
            data: {
                x: x !== undefined ? Number(x) : existingObject.x,
                y: y !== undefined ? Number(y) : existingObject.y,
                type: type || existingObject.type,
                payload: payload !== undefined ? payload : existingObject.payload
            }
        });

        res.status(200).json({
            message: "Interactive object updated successfully",
            object: updatedObject
        });
    } catch (error) {
        console.error("Error updating interactive object:", error);
        res.status(500).json({ error: "Failed to update object." });
    }
});

export default spaceRouter;