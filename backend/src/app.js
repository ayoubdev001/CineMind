import express from 'express';
import { apiReference } from '@scalar/express-api-reference';

const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/openapi.json', (req, res) => res.sendFile(path.resolve('docs/openapi.json')));
app.use('/reference', apiReference({ theme: "purple", url: '/openapi.json' }));

export default app;