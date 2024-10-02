"use client";

import React, { useEffect, useRef } from "react";
import spaceshipImg from "../../img/ship.png";
import asteroidImg from "../../img/meteor.png";
import bulletImg from "../../img/bullet.png";
import bossImg from "../../img/boss.png";

// Tạo một interface để xử lý lỗi TypeScript với hình ảnh
interface ImageWithLoaded extends HTMLImageElement {
  loaded?: boolean;
}

// Game configuration
const gameConfig = {
  spaceship: {
    width: 50,
    height: 50,
    speed: 5,
    maxHp: 100,
    shootDelay: 200,
    damage: 1, // Sát thương gây ra bởi đạn của tàu vũ trụ
    initialEnergy: 100,
    energyPerShot: 2,
    energyGainPerAsteroid: 2,
    invincibilityTime: 1000, // Thời gian bất tử sau khi bị va chạm (ms)
    energyRegenRate: 3, // Số energy hồi mỗi giây
  },
  asteroid: {
    width: 30,
    height: 30,
    speed: 2,
    maxHp: 3,
    spawnDelay: 1000,
    minSpawnDelay: 500,
    maxCount: 8,
    collisionDamage: 10, // Sát thương khi va chạm với tàu vũ trụ
    initialSpawnRate: 1000, // Tốc độ sinh thiên thạch ban đầu (ms)
    minSpawnRate: 500, // Tốc độ sinh thiên thạch tối thiểu (ms)
    spawnRateDecrease: 0.98, // Hệ số giảm tốc độ sinh (nhân vào sau mỗi lần sinh)
    maxSimultaneousSpawn: 2, // Số lượng thiên thạch tối đa sinh ra cùng lúc
    spawnChance: 0.7, // Xác suất sinh thiên thạch mỗi lần kiểm tra (0-1)
  },
  boss: {
    width: 100,
    height: 100,
    speed: 0.5,
    maxHp: 200,
    shootDelay: 1000,
    appearanceThreshold: 10,
    thresholdIncrement: 10,
    damage: 2, // Sát thương gây ra bởi đạn của boss
  },
  bullet: {
    width: 5,
    height: 10,
    speed: 5,
  },
  difficulty: {
    increaseFactor: 0.95, // Hệ số tăng độ khó (nhân vào sau mỗi lần sinh thiên thạch)
    increaseInterval: 10000, // Khoảng thời gian tăng độ khó (ms)
  },
  energyAsteroid: {
    width: 20,
    height: 20,
    speed: 3,
    spawnInterval: 3000, // Tăng lên 3 giây
    spawnChance: 0.5, // Tăng xác suất lên 50%
    maxSimultaneousSpawn: 1, // Giảm xuống 1
    energyBonus: 20,
  },
};

class GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  image: ImageWithLoaded;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    speed: number,
    imageSrc: string
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.image = new Image() as ImageWithLoaded;
    this.image.src = imageSrc;
    this.image.onload = () => {
      this.image.loaded = true;
    };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.image.loaded) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = "black";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  //   update(_currentTime?: number): void {
  //     // Phương thức cập nhật mặc định
  //     // Không làm gì cả, nhưng vẫn giữ tham số để tương thích với các lớp con
  //   }
}

class Spaceship extends GameObject {
  bullets: Bullet[];
  lastShot: number;
  shootDelay: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  lastCollisionTime: number;

  constructor(x: number, y: number) {
    super(
      x,
      y,
      gameConfig.spaceship.width,
      gameConfig.spaceship.height,
      gameConfig.spaceship.speed,
      spaceshipImg.src
    );
    this.bullets = [];
    this.lastShot = 0;
    this.shootDelay = gameConfig.spaceship.shootDelay;
    this.maxHp = gameConfig.spaceship.maxHp;
    this.hp = this.maxHp;
    this.maxEnergy = gameConfig.spaceship.initialEnergy;
    this.energy = this.maxEnergy;
    this.lastCollisionTime = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx);

    // Comment phần vẽ thanh máu
    /*
    // Vẽ thanh máu
    const hpBarWidth = 50;
    const hpBarHeight = 5;
    const hpBarX = this.x;
    const hpBarY = this.y - 15;

    ctx.fillStyle = "red";
    ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

    ctx.fillStyle = "green";
    ctx.fillRect(
      hpBarX,
      hpBarY,
      (this.hp / this.maxHp) * hpBarWidth,
      hpBarHeight
    );

    // Hiển thị phần trăm HP
    ctx.fillStyle = "white";
    ctx.font = "10px Arial";
    ctx.fillText(
      `${Math.round((this.hp / this.maxHp) * 100)}%`,
      hpBarX + hpBarWidth + 5,
      hpBarY + hpBarHeight
    );
    */

    // Giữ nguyên phần vẽ thanh năng lượng
    // Vẽ thanh năng lượng
    const energyBarWidth = 50;
    const energyBarHeight = 5;
    const energyBarX = this.x;
    const energyBarY = this.y - 10;

    ctx.fillStyle = "gray";
    ctx.fillRect(energyBarX, energyBarY, energyBarWidth, energyBarHeight);

    ctx.fillStyle = "blue";
    ctx.fillRect(
      energyBarX,
      energyBarY,
      (this.energy / this.maxEnergy) * energyBarWidth,
      energyBarHeight
    );

    // Hiển thị phần trăm Energy
    ctx.fillStyle = "white";
    ctx.fillText(
      `${Math.round((this.energy / this.maxEnergy) * 100)}%`,
      energyBarX + energyBarWidth + 5,
      energyBarY + energyBarHeight
    );
  }

  moveTo(x: number, y: number, canvasWidth: number, canvasHeight: number) {
    // Điều chỉnh vị trí x để máy bay nằm giữa ngón tay
    this.x = Math.max(
      0,
      Math.min(x - this.width / 2, canvasWidth - this.width)
    );

    // Tăng khoảng cách offset
    const baseOffset = 10;
    // Tính toán hệ số dựa trên vị trí y của ngón tay
    const factor = 1 + y / canvasHeight; // Hệ số sẽ tăng khi ngón tay ở phía dưới màn hình

    // Tính toán offset cuối cùng
    const dynamicOffset = baseOffset * factor;

    // Điều chỉnh vị trí y để máy bay luôn ở phía trên ngón tay một khoảng cách
    this.y = Math.max(
      0,
      Math.min(y - this.height - dynamicOffset, canvasHeight - this.height)
    );
  }

  shoot(currentTime: number) {
    if (
      currentTime - this.lastShot > this.shootDelay &&
      this.energy >= gameConfig.spaceship.energyPerShot
    ) {
      this.bullets.push(new Bullet(this.x + this.width / 2, this.y, 5, -1));
      this.lastShot = currentTime;
      this.energy -= gameConfig.spaceship.energyPerShot;
    }
  }

  gainEnergy(amount: number) {
    this.energy = Math.min(this.maxEnergy, this.energy + amount);
  }

  update(currentTime: number, deltaTime: number): void {
    this.shoot(currentTime);
    this.bullets = this.bullets.filter((bullet) => bullet.y > 0);
    this.bullets.forEach((bullet) => bullet.update());

    // Hồi energy tự động
    this.gainEnergy((gameConfig.spaceship.energyRegenRate * deltaTime) / 1000);
  }

  // Comment hoặc vô hiệu hóa phương thức takeDamage
  /*
  takeDamage(damage: number, currentTime: number) {
    if (
      currentTime - this.lastCollisionTime >
      gameConfig.spaceship.invincibilityTime
    ) {
      this.hp = Math.max(0, this.hp - damage);
      this.lastCollisionTime = currentTime;
    }
  }
  */

  // Thay thế bằng phương thức rỗng
  takeDamage(damage: number, currentTime: number) {
    // Không làm gì cả
  }

  isInvincible(currentTime: number): boolean {
    return (
      currentTime - this.lastCollisionTime <
      gameConfig.spaceship.invincibilityTime
    );
  }
}

class Bullet extends GameObject {
  direction: number;

  constructor(
    x: number,
    y: number,
    speed: number = gameConfig.bullet.speed,
    direction: number = -1
  ) {
    super(
      x,
      y,
      gameConfig.bullet.width,
      gameConfig.bullet.height,
      speed,
      bulletImg.src
    );
    this.direction = direction; // -1 cho đạn đi lên, 1 cho đạn đi xuống
  }

  update(): void {
    this.y += this.speed * this.direction;
  }
}

class Asteroid extends GameObject {
  hp: number;

  constructor(x: number) {
    super(
      x,
      0,
      gameConfig.asteroid.width,
      gameConfig.asteroid.height,
      gameConfig.asteroid.speed,
      asteroidImg.src
    );
    this.hp = gameConfig.asteroid.maxHp;
  }

  update(): void {
    this.y += this.speed;
  }

  takeDamage(damage: number) {
    this.hp -= damage;
  }

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx);

    // Vẽ thanh máu cho thiên thạch
    const hpBarWidth = 30;
    const hpBarHeight = 3;
    const hpBarX = this.x;
    const hpBarY = this.y - 5;

    ctx.fillStyle = "red";
    ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

    ctx.fillStyle = "green";
    ctx.fillRect(hpBarX, hpBarY, (this.hp / 3) * hpBarWidth, hpBarHeight);
  }
}

class Boss extends GameObject {
  bullets: Bullet[];
  lastShot: number;
  shootDelay: number;
  hp: number;
  direction: number;

  constructor(x: number, y: number) {
    super(
      x,
      y,
      gameConfig.boss.width,
      gameConfig.boss.height,
      gameConfig.boss.speed,
      bossImg.src
    );
    this.bullets = [];
    this.lastShot = 0;
    this.shootDelay = gameConfig.boss.shootDelay;
    this.hp = gameConfig.boss.maxHp;
    this.direction = 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx);

    // Vẽ thanh máu cho boss
    const hpBarWidth = 100;
    const hpBarHeight = 10;
    const hpBarX = this.x;
    const hpBarY = this.y - 20;

    ctx.fillStyle = "red";
    ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

    ctx.fillStyle = "green";
    ctx.fillRect(hpBarX, hpBarY, (this.hp / 200) * hpBarWidth, hpBarHeight);
  }

  shoot(currentTime: number) {
    if (currentTime - this.lastShot > this.shootDelay) {
      // Bắn 3 viên đạn mỗi lần, hướng xuống dưới
      this.bullets.push(
        new Bullet(this.x + this.width / 2, this.y + this.height, 2, 1)
      ); // Đạn giữa
      this.bullets.push(
        new Bullet(this.x + this.width / 4, this.y + this.height, 2, 1)
      ); // Đạn trái
      this.bullets.push(
        new Bullet(this.x + (this.width * 3) / 4, this.y + this.height, 2, 1)
      ); // Đạn phải
      this.lastShot = currentTime;
    }
  }

  update(currentTime: number, canvasWidth: number): void {
    this.shoot(currentTime);
    this.bullets = this.bullets.filter(
      (bullet) => bullet.y < window.innerHeight
    );
    this.bullets.forEach((bullet) => bullet.update());

    // Di chuyển boss qua lại
    this.x += this.speed * this.direction;
    if (this.x <= 0 || this.x + this.width >= canvasWidth) {
      this.direction *= -1;
    }
  }

  takeDamage(damage: number) {
    this.hp = Math.max(0, this.hp - damage);
  }
}

// Thêm hàm kiểm tra va chạm
function checkCollision(obj1: GameObject, obj2: GameObject): boolean {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// Thêm lớp mới cho thiên thạch energy
class EnergyAsteroid extends GameObject {
  constructor(x: number) {
    super(
      x,
      0,
      gameConfig.energyAsteroid.width,
      gameConfig.energyAsteroid.height,
      gameConfig.energyAsteroid.speed,
      "" // Không cần hình ảnh nữa
    );
  }

  update(): void {
    this.y += this.speed;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width / 2,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();
  }
}

// Thêm hàm tính khoảng cách giữa hai điểm
function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Hàm kiểm tra và điều chỉnh vị trí của thiên thạch mới
function adjustAsteroidPosition(
  newAsteroid: Asteroid,
  existingAsteroids: Asteroid[],
  canvasWidth: number
): void {
  const minDistance = gameConfig.asteroid.width * 1.5; // Khoảng cách tối thiểu giữa các thiên thạch

  for (const asteroid of existingAsteroids) {
    if (
      distance(newAsteroid.x, newAsteroid.y, asteroid.x, asteroid.y) <
      minDistance
    ) {
      // Nếu quá gần, di chuyển thiên thạch mới sang phải hoặc trái
      newAsteroid.x = (newAsteroid.x + canvasWidth / 2) % canvasWidth;
      // Kiểm tra lại sau khi di chuyển
      adjustAsteroidPosition(newAsteroid, existingAsteroids, canvasWidth);
      return;
    }
  }
}

const SpaceGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spaceshipRef = useRef<Spaceship | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    spaceshipRef.current = new Spaceship(
      canvas.width / 2 - 25,
      canvas.height - 70
    );
    const asteroids: Asteroid[] = [];
    const energyAsteroids: EnergyAsteroid[] = [];
    let asteroidSpawnRate = gameConfig.asteroid.initialSpawnRate;
    let lastAsteroidTime = 0;
    let lastDifficultyIncrease = 0;
    const maxAsteroids = gameConfig.asteroid.maxCount;

    let destroyedAsteroids = 0;
    let destroyedAsteroidsCount = 0; // Thêm biến mới để đếm số thiên thạch đã bị bắn hạ
    let boss: Boss | null = null;
    let bossAppearanceThreshold = gameConfig.boss.appearanceThreshold;
    let lastTime = 0;
    let lastEnergyAsteroidTime = 0;

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (spaceshipRef.current) {
        // Update and draw spaceship
        spaceshipRef.current.update(currentTime, deltaTime);
        spaceshipRef.current.draw(ctx);

        // Update and draw bullets
        spaceshipRef.current.bullets.forEach((bullet) => {
          bullet.update();
          bullet.draw(ctx);
        });
      }

      // Tăng độ khó theo thời gian
      if (
        currentTime - lastDifficultyIncrease >
        gameConfig.difficulty.increaseInterval
      ) {
        asteroidSpawnRate *= gameConfig.difficulty.increaseFactor;
        asteroidSpawnRate = Math.max(
          asteroidSpawnRate,
          gameConfig.asteroid.minSpawnRate
        );
        lastDifficultyIncrease = currentTime;
      }

      // Sinh thiên thạch mới
      if (currentTime - lastAsteroidTime > asteroidSpawnRate) {
        if (
          Math.random() < gameConfig.asteroid.spawnChance &&
          asteroids.length < gameConfig.asteroid.maxCount
        ) {
          const newAsteroidCount = Math.min(
            Math.floor(
              Math.random() * gameConfig.asteroid.maxSimultaneousSpawn
            ) + 1,
            gameConfig.asteroid.maxCount - asteroids.length
          );

          for (let i = 0; i < newAsteroidCount; i++) {
            const newAsteroid = new Asteroid(
              Math.random() * (canvas.width - gameConfig.asteroid.width)
            );
            adjustAsteroidPosition(newAsteroid, asteroids, canvas.width);
            asteroids.push(newAsteroid);
          }

          // Giảm tốc độ sinh thiên thạch
          asteroidSpawnRate *= gameConfig.asteroid.spawnRateDecrease;
          asteroidSpawnRate = Math.max(
            asteroidSpawnRate,
            gameConfig.asteroid.minSpawnRate
          );
        }
        lastAsteroidTime = currentTime;
      }

      // Update and draw asteroids
      for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.update();
        asteroid.draw(ctx);

        // Remove asteroids that are off screen
        if (asteroid.y > canvas.height) {
          asteroids.splice(i, 1);
        }
      }

      // Sinh thiên thạch energy
      if (
        currentTime - lastEnergyAsteroidTime >
        gameConfig.energyAsteroid.spawnInterval
      ) {
        if (Math.random() < gameConfig.energyAsteroid.spawnChance) {
          energyAsteroids.push(
            new EnergyAsteroid(
              Math.random() * (canvas.width - gameConfig.energyAsteroid.width)
            )
          );
        }
        lastEnergyAsteroidTime = currentTime;
      }

      // Update and draw energy asteroids
      for (let i = energyAsteroids.length - 1; i >= 0; i--) {
        const energyAsteroid = energyAsteroids[i];
        energyAsteroid.update();
        energyAsteroid.draw(ctx);

        // Remove energy asteroids that are off screen
        if (energyAsteroid.y > canvas.height) {
          energyAsteroids.splice(i, 1);
        }
      }

      // Update and draw boss
      if (boss) {
        boss.update(currentTime, canvas.width);
        boss.draw(ctx);

        // Update and draw boss bullets
        boss.bullets.forEach((bullet) => {
          bullet.update();
          bullet.draw(ctx);
        });

        // Kiểm tra va chạm giữa đạn của boss và tàu vũ trụ
        if (spaceshipRef.current) {
          for (let i = boss.bullets.length - 1; i >= 0; i--) {
            const bullet = boss.bullets[i];
            if (checkCollision(spaceshipRef.current, bullet)) {
              boss.bullets.splice(i, 1);
              // Comment phần gây sát thương
              /*
              spaceshipRef.current.takeDamage(
                gameConfig.boss.damage,
                currentTime
              );
              */
            }
          }
        }
      }

      // Check for collisions
      if (spaceshipRef.current) {
        // Kiểm tra va chạm giữa tàu vũ trụ và thiên thạch
        for (let i = asteroids.length - 1; i >= 0; i--) {
          const asteroid = asteroids[i];
          if (checkCollision(spaceshipRef.current, asteroid)) {
            // Comment phần xử lý va chạm gây sát thương
            /*
            if (!spaceshipRef.current.isInvincible(currentTime)) {
              spaceshipRef.current.takeDamage(
                gameConfig.asteroid.collisionDamage,
                currentTime
              );
            }
            */
            asteroids.splice(i, 1);
          }
        }

        // Kiểm tra va chạm giữa đạn của tàu vũ trụ và thiên thạch
        for (let i = spaceshipRef.current.bullets.length - 1; i >= 0; i--) {
          const bullet = spaceshipRef.current.bullets[i];
          for (let j = asteroids.length - 1; j >= 0; j--) {
            const asteroid = asteroids[j];
            if (checkCollision(bullet, asteroid)) {
              spaceshipRef.current.bullets.splice(i, 1);
              asteroid.takeDamage(gameConfig.spaceship.damage);
              if (asteroid.hp <= 0) {
                asteroids.splice(j, 1);
                destroyedAsteroids++;
                destroyedAsteroidsCount++; // Tăng số lượng thiên thạch đã bị bắn hạ
                if (
                  spaceshipRef.current.energy >=
                  gameConfig.spaceship.energyPerShot
                ) {
                  spaceshipRef.current.energy -=
                    gameConfig.spaceship.energyPerShot;
                  spaceshipRef.current.gainEnergy(
                    gameConfig.spaceship.energyGainPerAsteroid
                  );
                }

                // Kiểm tra điều kiện xuất hiện boss
                if (destroyedAsteroids === bossAppearanceThreshold && !boss) {
                  boss = new Boss(
                    canvas.width / 2 - gameConfig.boss.width / 2,
                    50
                  );
                  bossAppearanceThreshold += gameConfig.boss.thresholdIncrement;
                }
              }
              break;
            }
          }
        }

        // Kiểm tra va chạm giữa đạn và boss
        if (boss) {
          for (let i = spaceshipRef.current.bullets.length - 1; i >= 0; i--) {
            const bullet = spaceshipRef.current.bullets[i];
            if (
              boss &&
              bullet.x < boss.x + boss.width &&
              bullet.x + bullet.width > boss.x &&
              bullet.y < boss.y + boss.height &&
              bullet.y + bullet.height > boss.y
            ) {
              spaceshipRef.current.bullets.splice(i, 1);
              if (
                spaceshipRef.current.energy >=
                gameConfig.spaceship.energyPerShot
              ) {
                spaceshipRef.current.energy -=
                  gameConfig.spaceship.energyPerShot;
                boss.takeDamage(gameConfig.spaceship.damage);
                if (boss.hp <= 0) {
                  boss = null;
                }
              }
            }
          }
        }

        // Kiểm tra va chạm giữa tàu vũ trụ và thiên thạch energy
        for (let i = energyAsteroids.length - 1; i >= 0; i--) {
          const energyAsteroid = energyAsteroids[i];
          if (checkCollision(spaceshipRef.current, energyAsteroid)) {
            energyAsteroids.splice(i, 1);
            spaceshipRef.current.gainEnergy(
              gameConfig.energyAsteroid.energyBonus
            );
          }
        }
      }

      // Vẽ số lượng thiên thạch đã bị bắn hạ
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fillText(`Asteroids destroyed: ${destroyedAsteroidsCount}`, 10, 30);

      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (spaceshipRef.current) {
        switch (e.key) {
          case "ArrowLeft":
            spaceshipRef.current.moveTo(
              spaceshipRef.current.x - spaceshipRef.current.speed,
              spaceshipRef.current.y,
              canvas.width,
              canvas.height
            );
            break;
          case "ArrowRight":
            spaceshipRef.current.moveTo(
              spaceshipRef.current.x + spaceshipRef.current.speed,
              spaceshipRef.current.y,
              canvas.width,
              canvas.height
            );
            break;
          case "ArrowUp":
            spaceshipRef.current.moveTo(
              spaceshipRef.current.x,
              spaceshipRef.current.y - spaceshipRef.current.speed,
              canvas.width,
              canvas.height
            );
            break;
          case "ArrowDown":
            spaceshipRef.current.moveTo(
              spaceshipRef.current.x,
              spaceshipRef.current.y + spaceshipRef.current.speed,
              canvas.width,
              canvas.height
            );
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Touch controls
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (spaceshipRef.current) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // Sử dụng phương thức moveTo đã được cập nhật
        spaceshipRef.current.moveTo(x, y, canvas.width, canvas.height);
      }
    };

    // Thm xử lý cho sự kiện touchstart
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      handleTouchMove(e); // Xử lý ngay khi bắt đầu chạm
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-screen touch-none" />;
};

export default SpaceGame;
