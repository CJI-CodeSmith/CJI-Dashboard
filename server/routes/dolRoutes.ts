// Defines Express routes for DOL inspection data endpoints

import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { fetchInspections } from "../controllers/dolController";
import { Router } from "express";

const router = Router();

// get inspections from DOL API based on filtered params
router.get(
  "/inspections",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await fetchInspections();
      res.json(data);
    } catch (err) {
      return next({
        log: "Error while fetching OSHA inspections data",
        status: 500,
        message: { err: "Error fetching OSHA inspections data" },
      });
    }
  },
);

export default router;
