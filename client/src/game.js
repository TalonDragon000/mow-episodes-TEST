import Phaser from "phaser";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

function preload() {
  this.load.spritesheet("player", "player.png", {
    frameWidth: 48,
    frameHeight: 48,
  });
  this.load.spritesheet("slime", "slime.png", {
    frameWidth: 32, // Assuming each frame is 32x32, adjust as needed
    frameHeight: 32,
  });
}

function create() {
  this.players = new Map();
  this.cursors = this.input.keyboard.createCursorKeys();

  // Create animations
  this.anims.create({
    key: "idleDown",
    frames: this.anims.generateFrameNumbers("player", { start: 0, end: 5 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "idleRight",
    frames: this.anims.generateFrameNumbers("player", { start: 6, end: 11 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "idleUp",
    frames: this.anims.generateFrameNumbers("player", { start: 12, end: 17 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "walkDown",
    frames: this.anims.generateFrameNumbers("player", { start: 18, end: 23 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "walkRight",
    frames: this.anims.generateFrameNumbers("player", { start: 24, end: 29 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "walkUp",
    frames: this.anims.generateFrameNumbers("player", { start: 30, end: 35 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "attackDown",
    frames: this.anims.generateFrameNumbers("player", { start: 36, end: 39 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "attackRight",
    frames: this.anims.generateFrameNumbers("player", { start: 42, end: 45 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "attackUp",
    frames: this.anims.generateFrameNumbers("player", { start: 48, end: 51 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "die",
    frames: this.anims.generateFrameNumbers("player", { start: 54, end: 56 }),
    frameRate: 10,
    repeat: 0,
  });

  // Create slime animations
  this.anims.create({
    key: "slimeIdleDown",
    frames: this.anims.generateFrameNumbers("slime", { start: 0, end: 3 }),
    frameRate: 5,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeIdleRight",
    frames: this.anims.generateFrameNumbers("slime", { start: 7, end: 10 }),
    frameRate: 5,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeIdleUp",
    frames: this.anims.generateFrameNumbers("slime", { start: 14, end: 17 }),
    frameRate: 5,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeHopDown",
    frames: this.anims.generateFrameNumbers("slime", { start: 21, end: 26 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeHopRight",
    frames: this.anims.generateFrameNumbers("slime", { start: 28, end: 33 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeHopUp",
    frames: this.anims.generateFrameNumbers("slime", { start: 35, end: 40 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeJumpDown",
    frames: this.anims.generateFrameNumbers("slime", { start: 42, end: 48 }),
    frameRate: 15,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeJumpRight",
    frames: this.anims.generateFrameNumbers("slime", { start: 49, end: 55 }),
    frameRate: 15,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeJumpUp",
    frames: this.anims.generateFrameNumbers("slime", { start: 56, end: 62 }),
    frameRate: 15,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeConfuseDown",
    frames: this.anims.generateFrameNumbers("slime", { start: 63, end: 65 }),
    frameRate: 5,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeConfuseRight",
    frames: this.anims.generateFrameNumbers("slime", { start: 66, end: 68 }),
    frameRate: 5,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeConfuseUp",
    frames: this.anims.generateFrameNumbers("slime", { start: 69, end: 71 }),
    frameRate: 5,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeDie",
    frames: this.anims.generateFrameNumbers("slime", { start: 72, end: 76 }),
    frameRate: 10,
    repeat: 0,
  });

  this.slimes = this.physics.add.group();

  for (let i = 0; i < 10; i++) {
    const x = Phaser.Math.Between(0, 800);
    const y = Phaser.Math.Between(0, 600);
    const slime = this.slimes.create(x, y, "slime");
    slime.play("slimeIdleDown");
  }

  socket.on("gameState", (gameState) => {
    // Update or create players
    gameState.players.forEach((playerData) => {
      let player = this.players.get(playerData.id);

      if (!player) {
        // Create new player sprite
        player = this.physics.add.sprite(playerData.x, playerData.y, "player");
        player.setScale(1.5);
        this.players.set(playerData.id, player);
      }

      // Update player position and animation
      player.x = playerData.x;
      player.y = playerData.y;
      if (playerData.animation) {
        player.anims.play(playerData.animation, true);
        player.flipX = playerData.flipX;
      }
    });

    // Remove disconnected players
    const currentPlayerIds = gameState.players.map((p) => p.id);
    Array.from(this.players.keys()).forEach((playerId) => {
      if (!currentPlayerIds.includes(playerId)) {
        this.players.get(playerId).destroy();
        this.players.delete(playerId);
      }
    });

    // Update slimes
    gameState.slimes.forEach((slimeData, index) => {
      let slime = this.slimes.getChildren()[index];
      if (!slime) {
        slime = this.slimes.create(slimeData.x, slimeData.y, "slime");
      }
      slime.x = slimeData.x;
      slime.y = slimeData.y;
      if (slimeData.animation) {
        slime.play(slimeData.animation, true);
        slime.flipX = slimeData.flipX;
      }
    });
  });
}

function update() {
  const inputState = {
    left: this.cursors.left.isDown,
    right: this.cursors.right.isDown,
    up: this.cursors.up.isDown,
    down: this.cursors.down.isDown,
  };

  socket.emit("playerInput", inputState);
}
