const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const GameState = require("./game");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const gameState = new GameState();

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);
  gameState.addPlayer(socket.id);

  socket.on("playerInput", (inputState) => {
    gameState.update(socket.id, inputState);
    io.emit("gameState", {
      players: Array.from(gameState.players.entries()).map(([id, player]) => ({
        id,
        ...player,
      })),
      slimes: gameState.slimes,
    });
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    gameState.removePlayer(socket.id);
    io.emit("gameState", {
      players: Array.from(gameState.players.entries()).map(([id, player]) => ({
        id,
        ...player,
      })),
      slimes: gameState.slimes,
    });
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});