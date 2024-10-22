require("dotenv").config()
const cors = require('cors');
const bodyParser = require('body-parser');
require("./config/database").connect()
const express = require("express");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
module.exports = app;
