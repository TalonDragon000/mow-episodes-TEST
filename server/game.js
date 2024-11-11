class GameState {
    constructor() {
      this.FRAME_WIDTH = 800;
      this.FRAME_HEIGHT = 600;
      this.PADDING = 50;
      this.SLIME_SIZE = 32;
      this.MAX_DISTANCE = 200;
      this.ATTACK_RANGE = 50;
      this.ATTACK_DAMAGE = 25;
      this.ATTACK_COOLDOWN = 500;
      this.SLIME_RESPAWN_TIME = 60000; // 60 seconds in milliseconds
      this.MAX_SLIMES = 10;

      this.players = new Map();
      this.slimes = this.initializeSlimes(10);
    }

    initializeSlimes(count) {
      return Array(count).fill(null).map(() => {
        const x = this.PADDING + Math.random() * (this.FRAME_WIDTH - 2 * this.PADDING);
        const y = this.PADDING + Math.random() * (this.FRAME_HEIGHT - 2 * this.PADDING);
        const speed = 50;
        const velocityX = (Math.random() * 2 - 1) * speed;
        const velocityY = (Math.random() * 2 - 1) * speed;

        return {
          x, y,
          initialX: x,
          initialY: y,
          velocityX, velocityY,
          animation: this.getSlimeAnimation(velocityX, velocityY),
          flipX: velocityX < 0,
          health: 100,
          isAlive: true,
          id: Math.random().toString(36).substring(2, 9)
        };
      });
    }

    addPlayer(socketId) {
      this.players.set(socketId, {
        x: 400,
        y: 300,
        animation: "idleDown",
        flipX: false,
        socketId: socketId,
        id: socketId,
        displayName: `Player ${socketId.slice(0, 4)}`,
        lastDirection: 'Down',
        facing: 'Down',
        isAttacking: false,
        attackStartTime: 0
      });
    }
  
    removePlayer(socketId) {
      this.players.delete(socketId);
    }
  
    update(socketId, inputState) {
      const player = this.players.get(socketId);
      if (!player) return;
  
      const speed = 160;
      const delta = 1/60;

      // Handle attack animation and cooldown
      const currentTime = Date.now();
      if (inputState.space && !player.isAttacking) {
        player.isAttacking = true;
        player.attackStartTime = currentTime;
        player.animation = `attack${player.facing}`;
        this.handleAttack(player, socketId);
        return;
      }

      // Check if attack animation should still be playing
      if (player.isAttacking) {
        if (currentTime - player.attackStartTime < this.ATTACK_COOLDOWN) {
          return; // Keep playing attack animation
        } else {
          player.isAttacking = false;
        }
      }

      // Reset movement flags
      let isMoving = false;
      
      // Handle player movement and direction tracking
      if (inputState.left) {
        player.x -= speed * delta;
        player.animation = "walkRight";  // Use right animation frames
        player.flipX = true;  // Flip the sprite horizontally
        player.facing = 'Left';
        isMoving = true;
      } else if (inputState.right) {
        player.x += speed * delta;
        player.animation = "walkRight";
        player.flipX = false;  // Normal orientation
        player.facing = 'Right';
        isMoving = true;
      }
  
      if (inputState.up) {
        player.y -= speed * delta;
        player.animation = "walkUp";
        player.facing = 'Up';
        isMoving = true;
      } else if (inputState.down) {
        player.y += speed * delta;
        player.animation = "walkDown";
        player.facing = 'Down';
        isMoving = true;
      }
  
      // Set idle animation when not moving
      if (!isMoving) {
        player.animation = `idle${player.facing}`;
      }
  
      this.updateSlimes();
    }

    getSlimeAnimation(velocityX, velocityY) {
      if (!velocityX && !velocityY) {
        return "slimeIdleDown";
      }
      
      // Calculate speed magnitude
      const speed = Math.hypot(velocityX, velocityY);
      const isJumping = speed > 75; // Threshold for jump animation
      
      if (Math.abs(velocityX) > Math.abs(velocityY)) {
        // Horizontal movement
        if (isJumping) {
          return velocityX > 0 ? "slimeJumpRight" : "slimeJumpLeft";
        } else {
          return velocityX > 0 ? "slimeHopRight" : "slimeHopLeft";
        }
      } else {
        // Vertical movement
        if (isJumping) {
          return velocityY > 0 ? "slimeJumpDown" : "slimeJumpUp";
        } else {
          return velocityY > 0 ? "slimeHopDown" : "slimeHopUp";
        }
      }
    }
  
    updateSlimes() {
      // Remove dead slimes and schedule respawn
      this.slimes = this.slimes.filter(slime => {
        if (slime.health <= 0 && slime.isAlive) {
          slime.isAlive = false;
          slime.animation = "slimeDie";
          
          // Schedule a new slime to spawn
          setTimeout(() => {
            if (this.slimes.length < this.MAX_SLIMES) {
              const newSlime = this.initializeSlimes(1)[0];
              this.slimes.push(newSlime);
            }
          }, this.SLIME_RESPAWN_TIME);
          
          return false; // Remove this slime
        }
        return true;
      });

      // Update remaining slimes
      this.slimes.forEach((slime, index) => {
        // Update position
        slime.x += slime.velocityX * (1/60);
        slime.y += slime.velocityY * (1/60);

        let shouldChangeDirection = false;
        let newVelocityX = slime.velocityX;
        let newVelocityY = slime.velocityY;

        // 1. Check frame boundaries
        if (slime.x <= this.SLIME_SIZE || slime.x >= this.FRAME_WIDTH - this.SLIME_SIZE) {
          newVelocityX = -slime.velocityX;
          shouldChangeDirection = true;
        }
        if (slime.y <= this.SLIME_SIZE || slime.y >= this.FRAME_HEIGHT - this.SLIME_SIZE) {
          newVelocityY = -slime.velocityY;
          shouldChangeDirection = true;
        }

        // 2. Check distance from initial position
        const distanceFromStart = Math.hypot(
          slime.x - slime.initialX,
          slime.y - slime.initialY
        );
        if (distanceFromStart > this.MAX_DISTANCE) {
          newVelocityX = -slime.velocityX;
          newVelocityY = -slime.velocityY;
          shouldChangeDirection = true;
        }

        // 3. Check collisions with other slimes
        this.slimes.forEach((otherSlime, otherIndex) => {
          if (index !== otherIndex) {
            const distance = Math.hypot(
              slime.x - otherSlime.x,
              slime.y - otherSlime.y
            );
            if (distance < this.SLIME_SIZE) {
              newVelocityX = -slime.velocityX;
              newVelocityY = -slime.velocityY;
              shouldChangeDirection = true;
            }
          }
        });

        // Update slime properties if direction changed
        if (shouldChangeDirection) {
          slime.velocityX = newVelocityX;
          slime.velocityY = newVelocityY;
          slime.animation = this.getSlimeAnimation(slime.velocityX, slime.velocityY);
          slime.flipX = slime.velocityX < 0;
        }
      });
    }

    handleAttack(player, socketId) {
      player.animation = `attack${player.facing}`;
      
      setTimeout(() => { 
        player.isAttacking = false;
        if (!this.players.has(socketId)) return; // Player might have disconnected
        player.animation = `idle${player.facing}`;
      }, this.ATTACK_COOLDOWN);

      this.slimes.forEach((slime, index) => {
        if (!slime.isAlive) return;
        
        const inRange = Math.abs(player.x - slime.x) < this.ATTACK_RANGE && 
                       Math.abs(player.y - slime.y) < this.ATTACK_RANGE;

        if (inRange) {
          slime.health = Math.max(0, slime.health - this.ATTACK_DAMAGE);
          slime.animation = "slimeHit";
          
          console.log(`Player ${socketId.slice(0, 5)} hit Slime ${index}! Health: ${slime.health}`);
        }
      });
    }
  }
  
  module.exports = GameState;
