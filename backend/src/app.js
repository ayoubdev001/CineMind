import express from 'express';
import { apiReference } from '@scalar/express-api-reference';
import authRoutes from './routes/authRoutes.js';
import movieRoutes from "./routes/movieRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok' }));


app.use('/api/auth', authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/favorites", favoriteRoutes);

app.get('/openapi.json', (req, res) => res.sendFile(path.resolve('docs/openapi.json')));
app.use('/reference', apiReference({ theme: "purple", url: '/openapi.json' }));

app.use(errorHandler);

export default app;