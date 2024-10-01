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

  constructor(x: number, y: number) {
    super(x, y, 50, 50, 5, spaceshipImg.src);
    this.bullets = [];
    this.lastShot = 0;
    this.shootDelay = 200;
    this.maxHp = 100;
    this.hp = this.maxHp;
  }

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx);

    // Vẽ thanh máu
    const hpBarWidth = 50;
    const hpBarHeight = 5;
    const hpBarX = this.x;
    const hpBarY = this.y - 10;

    ctx.fillStyle = "red";
    ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

    ctx.fillStyle = "green";
    ctx.fillRect(
      hpBarX,
      hpBarY,
      (this.hp / this.maxHp) * hpBarWidth,
      hpBarHeight
    );
  }

  moveTo(x: number, y: number, canvasWidth: number, canvasHeight: number) {
    // Điều chỉnh vị trí x để máy bay nằm giữa ngón tay
    this.x = Math.max(
      0,
      Math.min(x - this.width / 2, canvasWidth - this.width)
    );

    // Tăng khoảng cách offset
    const baseOffset = 60; // Khoảng cách cơ bản giữa máy bay và ngón tay

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
    if (currentTime - this.lastShot > this.shootDelay) {
      this.bullets.push(new Bullet(this.x + this.width / 2, this.y, 5, -1)); // Đạn đi lên
      this.lastShot = currentTime;
    }
  }

  update(currentTime: number): void {
    this.shoot(currentTime);
    this.bullets = this.bullets.filter((bullet) => bullet.y > 0);
    this.bullets.forEach((bullet) => bullet.update());
  }

  takeDamage(damage: number) {
    this.hp = Math.max(0, this.hp - damage);
  }
}

class Bullet extends GameObject {
  direction: number;

  constructor(x: number, y: number, speed: number = 5, direction: number = -1) {
    super(x, y, 5, 10, speed, bulletImg.src);
    this.direction = direction; // -1 cho đạn đi lên, 1 cho đạn đi xuống
  }

  update(): void {
    this.y += this.speed * this.direction;
  }
}

class Asteroid extends GameObject {
  hp: number;

  constructor(x: number) {
    super(x, 0, 30, 30, 2, asteroidImg.src);
    this.hp = 3;
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
    super(x, y, 100, 100, 0.5, bossImg.src);
    this.bullets = [];
    this.lastShot = 0;
    this.shootDelay = 1000; // Bắn mỗi giây
    this.hp = 200;
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
    let lastAsteroidTime = 0;
    let asteroidDelay = 1000; // Giảm xuống 1 giây
    const minAsteroidDelay = 500; // Thời gian tối thiểu giữa các thiên thạch
    const maxAsteroids = 8; // Tăng số lượng thiên thạch tối đa

    let destroyedAsteroids = 0;
    let boss: Boss | null = null;
    let bossAppearanceThreshold = 10;

    const gameLoop = (currentTime: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (spaceshipRef.current) {
        // Update and draw spaceship
        spaceshipRef.current.update(currentTime);
        spaceshipRef.current.draw(ctx);

        // Update and draw bullets
        spaceshipRef.current.bullets.forEach((bullet) => {
          bullet.update();
          bullet.draw(ctx);
        });
      }

      // Create new asteroids
      if (
        currentTime - lastAsteroidTime > asteroidDelay &&
        asteroids.length < maxAsteroids
      ) {
        const newAsteroidCount = Math.floor(Math.random() * 2) + 1; // Tạo 1-3 thiên thạch mỗi lần
        for (let i = 0; i < newAsteroidCount; i++) {
          if (asteroids.length < maxAsteroids) {
            asteroids.push(new Asteroid(Math.random() * (canvas.width - 30)));
          }
        }
        lastAsteroidTime = currentTime;

        // Giảm thời gian chờ giữa các đợt thiên thạch
        asteroidDelay = Math.max(minAsteroidDelay, asteroidDelay * 0.95);
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
            if (
              bullet.x < spaceshipRef.current.x + spaceshipRef.current.width &&
              bullet.x + bullet.width > spaceshipRef.current.x &&
              bullet.y < spaceshipRef.current.y + spaceshipRef.current.height &&
              bullet.y + bullet.height > spaceshipRef.current.y
            ) {
              boss.bullets.splice(i, 1);
              spaceshipRef.current.takeDamage(2);
            }
          }
        }
      }

      // Check for collisions
      if (spaceshipRef.current) {
        for (let i = spaceshipRef.current.bullets.length - 1; i >= 0; i--) {
          const bullet = spaceshipRef.current.bullets[i];
          for (let j = asteroids.length - 1; j >= 0; j--) {
            const asteroid = asteroids[j];
            if (
              bullet.x < asteroid.x + asteroid.width &&
              bullet.x + bullet.width > asteroid.x &&
              bullet.y < asteroid.y + asteroid.height &&
              bullet.y + bullet.height > asteroid.y
            ) {
              spaceshipRef.current.bullets.splice(i, 1);
              asteroid.takeDamage(1); // Giảm sát thương xuống 1
              if (asteroid.hp <= 0) {
                asteroids.splice(j, 1);
                destroyedAsteroids++;

                // Kiểm tra điều kiện xuất hiện boss
                if (destroyedAsteroids === bossAppearanceThreshold && !boss) {
                  boss = new Boss(canvas.width / 2 - 50, 50);
                  bossAppearanceThreshold += 10; // Tăng ngưỡng cho lần tiếp theo
                }
              }
              break;
            }
          }

          // Kiểm tra va chạm giữa đạn và boss
          if (
            boss &&
            bullet.x < boss.x + boss.width &&
            bullet.x + bullet.width > boss.x &&
            bullet.y < boss.y + boss.height &&
            bullet.y + bullet.height > boss.y
          ) {
            spaceshipRef.current.bullets.splice(i, 1);
            boss.takeDamage(1); // Giảm sát thương xuống 1
            if (boss.hp <= 0) {
              boss = null;
            }
          }
        }

        // Check for collision between spaceship and asteroids
        for (let i = asteroids.length - 1; i >= 0; i--) {
          const asteroid = asteroids[i];
          if (
            spaceshipRef.current.x < asteroid.x + asteroid.width &&
            spaceshipRef.current.x + spaceshipRef.current.width > asteroid.x &&
            spaceshipRef.current.y < asteroid.y + asteroid.height &&
            spaceshipRef.current.y + spaceshipRef.current.height > asteroid.y
          ) {
            spaceshipRef.current.takeDamage(10);
            asteroids.splice(i, 1);
          }
        }
      }

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
