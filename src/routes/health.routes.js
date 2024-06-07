import { Router } from "express";
import { getHealth } from "../controllers/health.controllers.js";

const router = Router();

router.get("/health", getHealth)

export default router