require('dns').setServers(['8.8.8.8', '1.1.1.1']); // workaround for networks that block SRV lookups
require('dotenv').config();
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) { console.error('Missing JWT_SECRET or MONGO_URI in .env'); process.exit(1); }
const app = require('./app');
require('./config/db')().then(() => app.listen(process.env.PORT || 5000, () => console.log('API on port ' + (process.env.PORT || 5000))))
  .catch((e) => { console.error(e); process.exit(1); });
