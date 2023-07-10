const express = require("express");
const cors = require("cors");
const userRoutes = require("./route")
const dotenv = require(dotenv);
dotenv.config();
// Importing connection
require("./db/config");

// Getting functionality of express
const app = express();

// Middleware to process req before recieving
app.use(express.json());
// Middleware to avoid cors error
app.use(cors());

// Redirecting to routea
app.use('/', userRoutes);

// Starting server
app.listen(process.env.PORT);