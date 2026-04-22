// Entry point: loads environment variables, mounts routes, and starts the Express server

import 'dotenv/config';
import app from './app';
import dolRoutes from './routes/dolRoutes';
import dataWrapperRoutes from './routes/dataWrapperRoutes';

const PORT = process.env.PORT || 8888;

// setup for DOL routes
app.use('/api', dolRoutes);

// setup for Datawrapper routes
app.use('/api/datawrapper', dataWrapperRoutes);
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
