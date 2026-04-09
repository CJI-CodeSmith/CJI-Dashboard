// Entry point: loads environment variables, mounts routes, and starts the Express server


import 'dotenv/config';
import app from './app.ts';
import dolRoutes from './routes/dolRoutes.ts';
// TODO: import dataWrapperRoutes when written

const PORT = process.env.PORT || 8888;

// setup for DOL routes
app.use(dolRoutes);

// setup for Datawrapper routes

app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
