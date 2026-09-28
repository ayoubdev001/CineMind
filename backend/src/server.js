import 'dotenv/config';
import app from './app.js';
import sequelize from './config/db.js';

const port = process.env.PORT || 3000;

try {
  await sequelize.authenticate();
  await sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');
  await sequelize.sync(); // creates missing tables, never alters existing ones
  console.log('Database ready');
} catch (err) {
  console.error('Database setup failed:', err.message);
  process.exit(1);
}

app.listen(port, () => console.log(`API running on port ${port}`));