require('dotenv').config({ path: '.env.local' });
const express = require('express');
const drillsHandler = require('./api/drills');

const app = express();
app.use(express.json());
app.all('/api/drills', drillsHandler);
app.listen(3001, () => console.log('API: http://localhost:3001'));
