const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const authenticateWebSocket = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }

  try {
    const decoded = jwt.verify(token, "wintelpanki");
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    return next(new Error("Authentication error: Invalid token"));
  }
};

io.use(authenticateWebSocket);

io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  socket.on("IncomingData", (data) => {
    console.log("Informacion Recibida:", data);

    io.emit("IncomingData", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });
});

const port = 5555;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
