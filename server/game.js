class GameState {
  constructor() {
    this.players = new Map(); // Store players by socket ID
    this.slimes = Array(10)
      .fill(null)
      .map(() => ({
        x: Math.random() * 800,
        y: Math.random() * 600,
        animation: "slimeIdleDown",
        flipX: false,
        velocityX: 0,
        velocityY: 0,
      }));
  }

  addPlayer(socketId) {
    this.players.set(socketId, {
      x: 400,
      y: 300,
      animation: "idleDown",
      flipX: false,
    });
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
  }

  update(socketId, inputState) {
    const player = this.players.get(socketId);
    if (!player) return;

    const speed = 160;
    const prevX = player.x;
    const prevY = player.y;

    // Handle player movement
    if (inputState.left) {
      player.x -= speed * (1 / 60);
      player.animation = "walkRight";
      player.flipX = true;
    } else if (inputState.right) {
      player.x += speed * (1 / 60);
      player.animation = "walkRight";
      player.flipX = false;
    }

    if (inputState.up) {
      player.y -= speed * (1 / 60);
      player.animation = "walkUp";
    } else if (inputState.down) {
      player.y += speed * (1 / 60);
      player.animation = "walkDown";
    }

    // Handle idle animations
    if (
      !inputState.left &&
      !inputState.right &&
      !inputState.up &&
      !inputState.down
    ) {
      if (prevX > player.x) {
        player.animation = "idleRight";
        player.flipX = true;
      } else if (prevX < player.x) {
        player.animation = "idleRight";
        player.flipX = false;
      } else if (prevY > player.y) {
        player.animation = "idleUp";
      } else if (prevY < player.y) {
        player.animation = "idleDown";
      }
    }

    this.updateSlimes();
  }

  updateSlimes() {
    this.slimes.forEach((slime) => {
      if (Math.random() < 0.02) {
        const direction = Math.floor(Math.random() * 4);
        const speed = 50 + Math.random() * 100;

        switch (direction) {
          case 0:
            slime.velocityX = speed;
            slime.animation = "slimeHopRight";
            slime.flipX = false;
            break;
          case 1:
            slime.velocityX = -speed;
            slime.animation = "slimeHopRight";
            slime.flipX = true;
            break;
          case 2:
            slime.velocityY = speed;
            slime.animation = "slimeHopDown";
            break;
          case 3:
            slime.velocityY = -speed;
            slime.animation = "slimeHopUp";
            break;
        }
      }

      // Update slime positions
      slime.x += slime.velocityX * (1 / 60);
      slime.y += slime.velocityY * (1 / 60);
    });
  }
}

module.exports = GameState;
