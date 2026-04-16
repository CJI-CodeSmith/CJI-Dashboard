// Defines Express routes for DOL inspection data endpoints
import { fetchOshaData } from "../controllers/dolController";
import { Router } from "express";

const router = Router();

// get inspections from DOL API based on filtered params
router.get( "/inspections", fetchOshaData );

export default router;
