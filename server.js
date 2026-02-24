require('dotenv').config();

const express = require('express');
const configureDB = require('./config/db')
const cors = require('cors')
const userController = require("./app/controllers/user-controller")

const port = process.env.PORT || 5000;

const app = express();

configureDB();

app.use(cors())
app.use(express.json())

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "CRM API running" });
});

app.post("/api/user/register", userController.register);
app.post("/api/user/login", userController.login);

app.listen(port, () => {
    console.log("The server is running on port ", port);
})