import "dotenv/config";
import { sequelize } from "../models/index.js";
import { searchCatalog } from "../services/airetrieverService.js";

const results = await searchCatalog("a funny animated movie");
for (const r of results) console.log(r.title, r.dataValues.distance);

await sequelize.close();