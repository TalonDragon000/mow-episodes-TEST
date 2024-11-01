import Phaser from "phaser";

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
  this.player = this.physics.add.sprite(400, 300, "player");
  this.player.setScale(1.5); // Scale the player sprite by 1.5 times
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

  this.player.play("idleDown");

  this.slimes = this.physics.add.group();

  for (let i = 0; i < 10; i++) {
    const x = Phaser.Math.Between(0, 800);
    const y = Phaser.Math.Between(0, 600);
    const slime = this.slimes.create(x, y, "slime");
    slime.play("slimeIdleDown");
  }
}

function update() {
  const speed = 160;
  const prevVelocity = this.player.body.velocity.clone();

  // Stop any previous movement from the last frame
  this.player.body.setVelocity(0);

  // Horizontal movement
  if (this.cursors.left.isDown) {
    this.player.body.setVelocityX(-speed);
    this.player.anims.play("walkRight", true); // Assuming you have a 'walkLeft' animation
    this.player.flipX = true; // Flip the sprite to face left
  } else if (this.cursors.right.isDown) {
    this.player.body.setVelocityX(speed);
    this.player.anims.play("walkRight", true);
    this.player.flipX = false; // Ensure the sprite is facing right
  }

  // Vertical movement
  if (this.cursors.up.isDown) {
    this.player.body.setVelocityY(-speed);
    this.player.anims.play("walkUp", true);
  } else if (this.cursors.down.isDown) {
    this.player.body.setVelocityY(speed);
    this.player.anims.play("walkDown", true);
  }

  // Normalize and scale the velocity so that player can't move faster along a diagonal
  this.player.body.velocity.normalize().scale(speed);

  // If no movement keys are pressed, stop the animation
  if (
    this.cursors.left.isUp &&
    this.cursors.right.isUp &&
    this.cursors.up.isUp &&
    this.cursors.down.isUp
  ) {
    this.player.anims.stop();

    // Set idle animation based on the last direction
    if (prevVelocity.x < 0) {
      this.player.anims.play("idleRight", true);
      this.player.flipX = true;
    } else if (prevVelocity.x > 0) {
      this.player.anims.play("idleRight", true);
      this.player.flipX = false;
    } else if (prevVelocity.y < 0) {
      this.player.anims.play("idleUp", true);
    } else if (prevVelocity.y > 0) {
      this.player.anims.play("idleDown", true);
    }
  }

    // Keep player within screen boundaries
  if (this.player.x < 10) {
    this.player.x = 10; // Reset to left boundary
  } else if (this.player.x > 790) {
    this.player.x = 790; // Reset to right boundary
  }

  if (this.player.y < 10) {
    this.player.y = 10; // Reset to top boundary
  } else if (this.player.y > 590) {
    this.player.y = 590; // Reset to bottom boundary
  }

  // Slime direction and speed movement
  this.slimes.children.iterate((slime) => {
    if (Phaser.Math.Between(0, 100) < 2) {
      const direction = Phaser.Math.Between(0, 3);
      const speed = Phaser.Math.Between(50, 150);
      switch (direction) {
        case 0:
          slime.setVelocityX(speed);
          slime.play("slimeHopRight", true);
          break;
        case 1:
          slime.setVelocityX(-speed);
          slime.play("slimeHopRight", true);
          slime.flipX = true;
          break;
        case 2:
          slime.setVelocityY(speed);
          slime.play("slimeHopDown", true);
          break;
        case 3:
          slime.setVelocityY(-speed);
          slime.play("slimeHopUp", true);
          break;
      }
    }

     // Keep slime within screen boundaries
    if (slime.x < 10) {
      slime.x = 10; // Reset to left boundary
    } else if (slime.x > 790) {
      slime.x = 790; // Reset to right boundary
    }

    if (slime.y < 10) {
      slime.y = 10; // Reset to top boundary
    } else if (slime.y > 590) {
      slime.y = 590; // Reset to bottom boundary
    }
  });
}
