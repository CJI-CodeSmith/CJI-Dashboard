// Configures the Express app: middleware (cors, json parsing) and global error handler

import express, {Request, Response} from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

export default app;
