// Defines Express routes for DOL inspection data endpoints
import { fetchOshaData, downloadCsv } from "../controllers/dolController.ts";
import { Router } from "express";

const router = Router();

// get inspections from DOL API based on filtered params
router.get( "/inspections", fetchOshaData );

// download the full scrubbed CSV
router.get( "/download-csv", downloadCsv );

export default router;
