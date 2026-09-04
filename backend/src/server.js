import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { startAutoReassignDaemon } from './services/autoReassignDaemon.js';

dotenv.config();

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDatabase();
    startAutoReassignDaemon();
    app.listen(PORT, () => {
      console.log(`[SERVER] Jansetu backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`[SERVER FATAL] Failed to start Jansetu backend: ${error.message}`);
    process.exit(1);
  }
};

startServer();
