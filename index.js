const express = require('express');
const cors = require('cors');
require('dotenv').config();

const bodyParser = require('body-parser');

const e = require('./src/utils/dictionary/status');
const userRoutes = require('./src/routes/userRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();

app.use(cors());
app.use(express.static('public'));

app.use(bodyParser.json());

app.use('/task', taskRoutes);
app.use('/', userRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Online na porta ${PORT}!`));