require('dotenv').config();

const express = require('express');
const configureDB = require('./config/db')
const cors = require('cors')
const userController = require("./app/controllers/user-controller")
const leadController = require(".app/controllers/lead-controller");
const authMiddleware = require(".app/middlewares/authorization");

const port = process.env.PORT || 5000;

const app = express();

configureDB();

app.use(cors())
app.use(express.json())

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "CRM API running" });
});

//user routes
app.post("/api/user/register", userController.register);
app.post("/api/user/login", userController.login);

//lead routes
app.post("/api/leads", authMiddleware, leadController.create);
app.get("/api/leads", authMiddleware, leadController.list);

app.listen(port, () => {
    console.log("The server is running on port ", port);
})