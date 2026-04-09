//server.ts 
import 'dotenv/config';
import app from './app.ts';
import dolRoutes from './routes/dolRoutes.ts';

const PORT = process.env.PORT || 8888;

app.use(dolRoutes);

app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
