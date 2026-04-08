
import express, {Request, Response, NextFunction} from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

interface Error {
    log?: string;
    status?: number;
    message?: any;
  }

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const defaultErr = {
      log: 'Express error handler caught unknown middleware error',
      status: 500,
      message: { err: 'An error occurred' },
    };
    const errorObj = Object.assign({}, defaultErr, err);
    console.log(errorObj.log);
    return res.status(errorObj.status).json(errorObj.message);
  });
export default app;
