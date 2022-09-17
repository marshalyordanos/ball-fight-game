const canvas = document.querySelector("canvas");
const scoreEl = document.querySelector(".scoreEl");
const c = canvas.getContext("2d");
const modalEl = document.querySelector("#modal");
const bigScore = document.querySelector("#bigScore");

bigScore;
const startBtn = document.querySelector("#startBtn");

canvas.width = innerWidth;
canvas.height = innerHeight;

function randomINtFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function distanceBetweenTwoPoint(x1, y1, x2, y2) {
  const x = x2 - x1;
  const y = y2 - y1;
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
}

const friction = 0.99;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw() {
    c.save();
    // c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }
  update() {
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01;
    this.draw();
  }
}
class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    this.draw();
  }
}
class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    this.draw();
  }
}

let player = new Player(canvas.width / 2, canvas.height / 2, 20, "white");

let projectiles = [];
let particles = [];
let enemies = [];
let score = 0;
function init() {
  clearInterval(setTime);
  player = new Player(canvas.width / 2, canvas.height / 2, 20, "white");

  projectiles = [];
  particles = [];
  enemies = [];
  scoreEl.innerHTML = 0;
  bigScore.innerHTML = 0;
  score = 0;
}

let setTime;
function spawnEnemies() {
  setTime = setInterval(() => {
    const radius = Math.random() * 30 + 7;
    let x;
    let y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;

      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const color = `hsl(${Math.random() * 360},50%,50%)`;
    const angle = Math.atan2(player.y - y, player.x - x);
    this.velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    enemies.push(new Enemy(x, y, radius, color, this.velocity));
    console.log("333333333", setTime);
  }, 1000);
}

function animate() {
  const animationId = requestAnimationFrame(animate);

  c.fillStyle = "rgba(0,0,0,0.1)";
  c.fillRect(0, 0, innerWidth, innerHeight);

  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      setTimeout(() => {
        particles.splice(index, 1);
      }, 0);
    } else {
      particle.update();
    }
  });

  projectiles.forEach((projectile, index) => {
    projectile.update();

    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });

  enemies.forEach((enemie, enemieIndex) => {
    const distEnumiePlayer = Math.hypot(
      player.x - enemie.x,
      player.y - enemie.y
    );
    //end game
    if (distEnumiePlayer - player.radius - enemie.radius < 1) {
      cancelAnimationFrame(animationId);
      modalEl.style.display = "flex";
      bigScore.innerHTML = score;
      console.log("game avor **********************");
    }

    projectiles.forEach((projectile, projectileINdex) => {
      // when projectiles touch enemy
      if (
        distanceBetweenTwoPoint(
          enemie.x,
          enemie.y,
          projectile.x,
          projectile.y
        ) -
          enemie.radius -
          projectile.radius <
        1
      ) {
        // create explosions
        for (let i = 0; i < enemie.radius; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemie.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 5),
                y: (Math.random() - 0.5) * (Math.random() * 5),
              }
            )
          );
        }
        if (enemie.radius > 13 && enemie.radius - 13 > 6) {
          gsap.to(enemie, {
            radius: enemie.radius - 13,
          });
          // add score
          score += 10;
          // score.textContent = parseInt(score.textContent) + 10;
          scoreEl.innerHTML = score;
          setTimeout(() => {
            projectiles.splice(projectileINdex, 1);
          }, 0);
        } else {
          // add score when the enimey die
          score += 30;
          scoreEl.innerHTML = score;
          setTimeout(() => {
            projectiles.splice(projectileINdex, 1);
            enemies.splice(enemieIndex, 1);
          }, 0);
        }
      }
    });
    enemie.update();
  });

  player.draw();
}

animate();
spawnEnemies();

addEventListener("keydown", function (event) {
  if (event.code == "KeyA") {
    player.x -= 5;
  } else if (event.code == "KeyD") {
    player.x += 5;
  } else if (event.code == "KeyW") {
    player.y -= 5;
  } else if (event.code == "KeyS") {
    player.y += 5;
  }
});

addEventListener("click", function (event) {
  const x = player.x;
  const y = player.y;
  const angle = Math.atan2(event.clientY - y, event.clientX - x);
  const velocity = {
    x: Math.cos(angle) * 7,
    y: Math.sin(angle) * 7,
  };

  projectiles.push(new Projectile(x, y, 10, "white", velocity));
});

startBtn.addEventListener("click", function () {
  init();
  console.log(particles, enemies);
  animate();
  spawnEnemies();
  modalEl.style.display = "none";
});
