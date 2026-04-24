import mongoose from 'mongoose';
import { createApp } from './app';
import { config } from './config/env';

/** Connects to MongoDB, creates the Express app, and listens on the configured port. */
async function start() {
  await mongoose.connect(config.mongodbUri);
  console.log('MongoDB Database connected successfully..!!');

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`App listening on port ${config.port}`);
  });
}

/** Logs fatal startup errors and exits the process. */
start().catch((err) => {
  console.error(err);
  process.exit(1);
});
