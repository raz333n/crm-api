require('dotenv').config();

const express = require('express');
const http = require("http");
const { Server } = require("socket.io");
const configureDB = require('./config/db')
const cors = require('cors')

const userController = require("./app/controllers/user-controller")
const leadController = require("./app/controllers/lead-controller");
const authenticateUser = require("./app/middlewares/authenticate");
const authorizeUser = require("./app/middlewares/authorization");
const activityController = require("../controllers/activity-controller");

const port = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.set("io", io);

configureDB();

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "OK", message: "CRM API running" });
});

//user routes
app.post('/api/users/register', userController.register);
app.post('/api/users/login', userController.login);

//account details
app.get('/api/users/account', authenticateUser, userController.account);

//get all users information
app.get('/api/users/list', authenticateUser, authorizeUser(['admin']), userController.list);

//remove
app.delete('/api/users/:userId', authenticateUser, authorizeUser(['admin']), userController.remove);

//lead routes
app.post('/api/leads', authenticateUser, leadController.create);
app.get('/api/leads', authenticateUser, authorizeUser(['manager']), leadController.list);
app.put('/api/leads/:id', authenticateUser, leadController.update);
app.delete('/api/leads/:id', authenticateUser, leadController.remove);
app.patch('/api/leads/:id/stage', authenticateUser, leadController.updateStage);
app.get('/api/leads/pipeline/view', authenticateUser, leadController.pipelineView);
app.patch('/api/leads/:id/move', authenticateUser, leadController.moveStage);

//activity
app.post("/api/activity",authenticateUser, activityController.create);
app.get("/api/activity/calendar", authenticateUser, activityController.calendar);
app.get("/api/activity/summary", activityController.summary);

app.get("/api/activity/:id",authenticateUser, activityController.getOne);
app.put("/api/activity/:id",authenticateUser, activityController.update);
app.delete("/api/activity/:id",authenticateUser, activityController.delete);

server.listen(port, () => {
  console.log("Server running on port", port);
});