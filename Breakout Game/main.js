//////////// Get the canvas element and its 2D context

const cvs = document.getElementById("breakOut");
const ctx = cvs.getContext("2d");

////////////// Set the canvas dimensions
const canvasWidth = 700;
const canvasHeight = 700;
cvs.width = canvasWidth;
cvs.height = canvasHeight;

///////////// Calculate the offset to center the canvas on the screen

const offsetX = (window.innerWidth - canvasWidth) / 2;
const offsetY = (window.innerHeight - canvasHeight) / 2;

////////////// Apply styles to the canvas
cvs.style.position = "absolute";
cvs.style.left = offsetX + "px";
cvs.style.top = offsetY + "px";
cvs.style.border = "5px solid rgb(142, 11, 203)";

//////////// Constants for paddle, ball, and game elements

const PADDLE_WIDTH = 150;
const PADDLE_HEIGHT = 20;
const PADDLE_MARGIN_BOTTOM = 50;
const BALL_RADIUS = 8;
const BACKGROUND = new Image();
BACKGROUND.src = "./bg2.jpg";

////////////// Game variables

let leftArrow = false;
let rightArrow = false;
let LIFE = 3;
let SCORE = 0;
let SCORE_UNIT = 20;
let LEVEL = 1;
let MAX_LEVEL = 3;

let GAME_OVER = false;

////// Audio Objects
let BRICK_HIT = new Audio();
let PADDLE_HIT = new Audio();
let LIFE_LOST = new Audio();
let WALL_COLLISION = new Audio();
let WIN_SOUND = new Audio();

///////audio sources to audio objects
BRICK_HIT.src = "./sounds/brick_hit.mp3";
PADDLE_HIT.src = "./sounds/paddle_hit.mp3";
LIFE_LOST.src = "./sounds/life_lost.mp3";
WALL_COLLISION.src = "./sounds/wall_collision.mp3";
WIN_SOUND.src = "./sounds/win_sound.mp3";

/////////////////// Paddle object

const paddle = {
  x: cvs.width / 2 - PADDLE_WIDTH / 2,
  y: cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dx: 5,
};

/////////////////// Function to draw the paddle

function drawPaddle() {
  ctx.fillStyle = "white";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  ctx.strokeStyle = "purple";
  ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

//////////////////// Event listeners for keydown and keyup events
document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft") {
    leftArrow = true;
  } else if (event.key === "ArrowRight") {
    rightArrow = true;
  }
});

document.addEventListener("keyup", function (event) {
  if (event.key === "ArrowLeft") {
    leftArrow = false;
  } else if (event.key === "ArrowRight") {
    rightArrow = false;
  }
});

////////////////////// Function to move the paddle based on arrow keys
function movePaddle() {
  if (rightArrow && paddle.x + paddle.width < cvs.width) {
    paddle.x += paddle.dx;
  } else if (leftArrow && paddle.x > 0) {
    paddle.x -= paddle.dx;
  }
}

///////////////// Ball object
const ball = {
  x: cvs.width / 2,
  y: paddle.y - BALL_RADIUS,
  radius: BALL_RADIUS,
  speed: 4,
  dx: 3,
  dy: -3,
};

////////////////// Function to draw the ball
function drawBall() {
  ctx.beginPath();

  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "yellow";
  ctx.fill();

  ctx.closePath();
}

///////////////////// Function to move the ball
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;
}

//////////////////// Function to handle ball-wall collisions
function ballWallCollision() {
  if (ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
    WALL_COLLISION.play();
  }
  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
    WALL_COLLISION.play();
  }
  if (ball.y + ball.radius > cvs.height) {
    LIFE--;
    resetBall();
  }
}

////////////////// Function to reset the ball position
function resetBall() {
  ball.x = cvs.width / 2;
  ball.y = paddle.y - BALL_RADIUS;
  ball.dx = 3;
  ball.dy = -3;
}

///////////////////// Function to handle ball-paddle collisions
function ballPaddleCollision() {
  if (
    ball.x < paddle.x + paddle.width &&
    ball.x > paddle.x &&
    ball.y < paddle.y + paddle.height &&
    ball.y > paddle.y
  ) {
    let collidePoint = ball.x - (paddle.x + paddle.width / 2);

    collidePoint = collidePoint / (paddle.width / 2);

    let angle = (collidePoint * Math.PI) / 3;

    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = -ball.speed * Math.cos(angle);
    PADDLE_HIT.play();
  }
}

////////////////////// Brick object and array to store brick positions
const brick = {
  row: 1,
  column: 5,
  width: 110,
  height: 20,
  offSetLeft: 20,
  offSetTop: 20,
  marginTop: 40,
  fillColor: "purple",
  strokeColor: "white",
};

let bricks = [];

/////////////////////// Function to create bricks
function createBricks() {
  for (let r = 0; r < brick.row; r++) {
    bricks[r] = [];
    for (let c = 0; c < brick.column; c++) {
      bricks[r][c] = {
        x: c * (brick.offSetLeft + brick.width) + brick.offSetLeft,
        y:
          r * (brick.offSetTop + brick.height) +
          brick.offSetTop +
          brick.marginTop,
        status: true,
      };
    }
  }
}

///////////////// Create set of bricks
createBricks();

/////////////////////// Function to draw bricks
function drawBricks() {
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      let b = bricks[r][c];
      if (b.status) {
        ctx.fillStyle = brick.fillColor;
        ctx.fillRect(b.x, b.y, brick.width, brick.height);

        ctx.strokeStyle = brick.strokeColor;
        ctx.strokeRect(b.x, b.y, brick.width, brick.height);
      }
    }
  }
}

/////////////////////// Function to handle ball-brick collisions
function ballBrickCollision() {
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      let b = bricks[r][c];
      if (b.status) {
        if (
          ball.x + ball.radius > b.x &&
          ball.x - ball.radius < b.x + brick.width &&
          ball.y + ball.radius > b.y &&
          ball.y - ball.radius < b.y + brick.height
        ) {
          ball.dy = -ball.dy;
          b.status = false;
          SCORE += SCORE_UNIT;
          BRICK_HIT.play();
        }
      }
    }
  }
}

//////////////////// Function to display game points on the canvas

function showGamePoints(text, textX, textY) {
  ctx.fillStyle = "white";
  ctx.font = "25px italic";
  ctx.fillText(text, textX, textY);
}

////////////////// Function to handle game over condition
function gameOver() {
  if (LIFE < 0) {
    GAME_OVER = true;
    showGamePoints("Game Over", cvs.width / 2 - 100, cvs.height / 2);
    showGamePoints(
      "Refresh to Play Again!",
      cvs.width / 2 - 150,
      cvs.height / 2 + 30
    );
  }
}

///////////////// Function to handle level up logic
function levelUp() {
  let isLevelDone = true;

  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      isLevelDone = isLevelDone && !bricks[r][c].status;
    }
  }

  if (isLevelDone) {
    if (LEVEL >= MAX_LEVEL) {
      GAME_OVER = true;
      WIN_SOUND.play();
      showGamePoints("Win Win !", cvs.width / 2 - 45, cvs.height / 2);
      return;
    }
    brick.row++;
    createBricks();
    ball.speed += 0.5;
    resetBall();
    LEVEL++;
  }
}

////////////// Function to draw elements on the canvas
function draw() {
  drawPaddle();
  drawBall();
  drawBricks();
  showGamePoints("Score:" + SCORE, 35, 25);
  showGamePoints("Live:" + LIFE, cvs.width - 85, 25);
  showGamePoints("Level:" + LEVEL, cvs.width / 2 - 40, 25);
}

/////////// Function to update game state
function update() {
  movePaddle();
  moveBall();
  ballWallCollision();
  ballPaddleCollision();
  ballBrickCollision();
  gameOver();
  levelUp();
}

//////////// Game loop function
function loop() {
  ////////// Draw the background image
  ctx.drawImage(BACKGROUND, 0, 0);

  draw(); /////////////////// Draw and update game elements

  update();

  //////////// Continue the game loop if the game is not over
  if (!GAME_OVER) {
    requestAnimationFrame(loop);
  }
}

loop(); ///////// Start the game loop
