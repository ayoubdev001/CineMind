import express from 'express';
import authRoutes from './routes/authRoutes.js';
import movieRoutes from "./routes/movieRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import { errorHandler } from './middleware/errorHandler.js';
import aiRoutes from "./routes/aiRoutes.js";
import { apiReference } from '@scalar/express-api-reference';
import path from "node:path";


const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok' }));


app.use('/api/auth', authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/ai", aiRoutes);


app.get("/openapi.yml", (req, res) =>
  res.sendFile(path.resolve("scalar.yml"))
);
app.use('/docs', apiReference({ theme: "purple", url: '/openapi.yml' }));

app.use(errorHandler);

export default app;