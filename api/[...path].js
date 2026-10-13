// Vercel serverless entry point for the existing Express API.
import app from '../server/index.js';

export const config = { api: { bodyParser: false } };
export default app;
