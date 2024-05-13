import { Router } from "express";
import { getHealth } from "../controllers/health.controllers.js";
import { validateToken } from "../middleware/jwtMiddleware.js";

const router = Router();

router.get("/health",validateToken, getHealth)

export default router