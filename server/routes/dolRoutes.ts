// routes for DOL API requests

import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { fetchInspections } from "../controllers/dolController";
import { Router } from 'express';
import { fetchInspections } from "../controllers/dolController";

const router = Router();

// get inspections from DOL API based on filtered params
router.get("/inspections", async (req: Request, res: Response, next: NextFunction) => {
    try{
  const data = await fetchInspections();
  res.json(data);
    } catch (err) {
       return next(err);
    }
});

export default router;