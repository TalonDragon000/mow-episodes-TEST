import Phaser from "phaser";
import { io } from "socket.io-client";

// Connect Client to Server with error handling
const socket = io("http://localhost:3000", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("Connected to server!");
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});

// Phaser config
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
  backgroundColor: "#2d572c",
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

function preload() {
  this.load.spritesheet("player", "player.png", { //currently a girl sprite
    frameWidth: 48,
    frameHeight: 48,
  });
  this.load.spritesheet("playerBoy", "playerBoy.png", {
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
  this.playerNames = new Map();
  this.cursors = this.input.keyboard.createCursorKeys();
  this.slimes = this.physics.add.group();

  // Create animation configuration object
  const animConfig = {
    player: [
      // Idle animations
      { key: 'idleDown', start: 0, end: 5, frameRate: 10 },
      { key: 'idleRight', start: 6, end: 11, frameRate: 10 },
      { key: 'idleLeft', start: 6, end: 11, frameRate: 10 },
      { key: 'idleUp', start: 12, end: 17, frameRate: 10 },
      
      // Walk animations
      { key: 'walkDown', start: 18, end: 23, frameRate: 10 },
      { key: 'walkRight', start: 24, end: 29, frameRate: 10 },
      { key: 'walkLeft', start: 24, end: 29, frameRate: 10 },
      { key: 'walkUp', start: 30, end: 35, frameRate: 10 },
      
      // Attack animations
      { key: 'attackDown', start: 36, end: 39, frameRate: 10, repeat: 0 },
      { key: 'attackRight', start: 42, end: 45, frameRate: 10, repeat: 0 },
      { key: 'attackLeft', start: 42, end: 45, frameRate: 10, repeat: 0 },
      { key: 'attackUp', start: 48, end: 51, frameRate: 10, repeat: 0 }
    ],
    
    /*playerBoy: [
      // Idle animations
      { key: 'idleDown2', start: 0, end: 5, frameRate: 8 },
      { key: 'idleRight2', start: 6, end: 11, frameRate: 8 },
      { key: 'idleUp2', start: 12, end: 17, frameRate: 8 },
      
      // Walk animations
      { key: 'walkDown2', start: 18, end: 23, frameRate: 12 },
      { key: 'walkRight2', start: 24, end: 29, frameRate: 12 },
      { key: 'walkUp2', start: 30, end: 35, frameRate: 12 },
      
      // Attack animations
      { key: 'attackDown2', start: 36, end: 39, frameRate: 12, repeat: 0 },
      { key: 'attackRight2', start: 40, end: 43, frameRate: 12, repeat: 0 },
      { key: 'attackUp2', start: 44, end: 47, frameRate: 12, repeat: 0 }
    ],
    */
    
    slime: [
      // Idle animations
      { key: 'slimeIdleDown', start: 0, end: 3, frameRate: 5 },
      { key: 'slimeIdleRight', start: 7, end: 10, frameRate: 5 },
      { key: 'slimeIdleLeft', start: 7, end: 10, frameRate: 5 },
      { key: 'slimeIdleUp', start: 14, end: 17, frameRate: 5 },
      
      // Hop animations
      { key: 'slimeHopDown', start: 21, end: 26, frameRate: 8 },
      { key: 'slimeHopRight', start: 28, end: 33, frameRate: 8 },
      { key: 'slimeHopLeft', start: 28, end: 33, frameRate: 8 },
      { key: 'slimeHopUp', start: 35, end: 40, frameRate: 8 },
      { key: 'slimeJumpDown', start: 42, end: 48, frameRate: 15 },
      { key: 'slimeJumpRight', start: 49, end: 55, frameRate: 15 },
      { key: 'slimeJumpLeft', start: 49, end: 55, frameRate: 15 },
      { key: 'slimeJumpUp', start: 56, end: 62, frameRate: 15 },
      
      // Hit and death animations
      { key: 'slimeHit', start: 63, end: 65, frameRate: 8, repeat: 0 },
      { key: 'slimeDie', start: 84, end: 89, frameRate: 8, repeat: 0 }
    ]
  };

  // Create animations
  Object.entries(animConfig).forEach(([spritesheet, animations]) => {
    animations.forEach(({ key, start, end, frameRate = 10, repeat = -1 }) => {
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(spritesheet, { start, end }),
        frameRate,
        repeat
      });
    });
  });

  // Define gameState handler methods
  this.handleGameState = (gameState) => {
    // Update players
    gameState.players.forEach((playerData) => {
      let player = this.players.get(playerData.socketId);
      let playerName = this.playerNames.get(playerData.socketId);

      if (!player) {
        // Create new player sprite
        player = this.physics.add.sprite(playerData.x, playerData.y, "player");
        player.setScale(1.5);
        this.players.set(playerData.socketId, player);
        
        // Create player name text
        playerName = this.add.text(playerData.x, playerData.y - 15, 
          playerData.displayName, {
          fontSize: '14px',
          fill: '#ffffff',
          backgroundColor: '#00000080',
          padding: { x: 4, y: 4 }
        });
        playerName.setOrigin(0.5, 0.5);
        this.playerNames.set(playerData.socketId, playerName);
      }

      // Update positions
      player.x = playerData.x;
      player.y = playerData.y;
      playerName.x = playerData.x;
      playerName.y = playerData.y - 15;
      
      // Update animation
      if (playerData.animation) {
        player.play(playerData.animation, true);
        player.flipX = playerData.flipX;
      }
    });

    // Clean up disconnected players
    Array.from(this.players.keys()).forEach((playerId) => {
      if (!gameState.players.some(p => p.socketId === playerId)) {
        this.players.get(playerId).destroy();
        this.players.delete(playerId);
        this.playerNames.get(playerId).destroy();
        this.playerNames.delete(playerId);
      }
    });

    // Update slimes
    gameState.slimes.forEach((slimeData, index) => {
      let slime = this.slimes.getChildren()[index];
      
      if (!slime || !slime.active) {
        slime = this.slimes.create(slimeData.x, slimeData.y, "slime");
        
        // Add health bar
        slime.healthBar = this.add.rectangle(
          slimeData.x,
          slimeData.y - 20,
          32,
          4,
          0x00ff00
        );

        // Add slime name
        /* slime.nameText = this.add.text(slimeData.x, slimeData.y - 30, 'Slime', {
          fontSize: '12px',
          fill: '#ffffff',
          backgroundColor: '#00000080',
          padding: { x: 3, y: 2 }
        });
        slime.nameText.setOrigin(0.5, 0.5);
        */
      }

      // Update position and health bar
      if (slime.active) {
        slime.x = slimeData.x;
        slime.y = slimeData.y;
        
        // Update health bar position
        if (slime.healthBar) {
          slime.healthBar.x = slimeData.x;
          slime.healthBar.y = slimeData.y - 20;
          slime.healthBar.width = (32 * slimeData.health) / 100;
          slime.healthBar.fillColor = slimeData.health > 50 ? 0x00ff00 : 0xff0000;
        }

        // Update name position
        if (slime.nameText) {
          slime.nameText.x = slimeData.x;
          slime.nameText.y = slimeData.y - 30;
        }

        // Handle animations
        if (!slimeData.isAlive) {
          slime.play("slimeDie", true);
          if (slime.healthBar) slime.healthBar.destroy();
          if (slime.nameText) slime.nameText.destroy();
          slime.once('animationcomplete', () => {
            slime.destroy();
          });
        } else if (slimeData.animation) {
          slime.play(slimeData.animation, true);
          slime.flipX = slimeData.flipX;
        }
      }
    });
  };

  // Attach gameState handler
  socket.on("gameState", this.handleGameState);
}

function update() {
  const inputState = {
    left: this.cursors.left.isDown,
    right: this.cursors.right.isDown,
    up: this.cursors.up.isDown,
    down: this.cursors.down.isDown,
    space: this.cursors.space.isDown
  };

  socket.emit("playerInput", inputState);
}
