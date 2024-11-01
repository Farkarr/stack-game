const score = document.getElementById("score");
const canvas = document.getElementById("canvas");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");


canvas.height = document.body.clientHeight;

const MODES = {
   FALL: "fall",
   BOUNCE: "bounce",
   GAMEOVER: "gameover"
};

const INITIAL_BOX_WIDTH = 200;
const INITIAL_BOX_Y = 600;

const BOX_HIGHT = 50;
const INITIAL_Y_SPEED = 5;
const INITIAL_X_SPEED = 2;

// State
let debris = { x: 0, y: 0, width: 0, height: BOX_HIGHT };
let boxes = [];
let scrollCounter, cameraY, current, mode, xSpeed, ySpeed;


function initGameState() {
   score.textContent = "1";
   boxes = [{
      x: canvas.width / 2 - INITIAL_BOX_WIDTH / 2, // para centrar la primera caja.
      y: 150,
      width: INITIAL_BOX_WIDTH,
      color: "white"
   }];

   current = 1;
   mode = MODES.BOUNCE;
   xSpeed = INITIAL_X_SPEED;
   ySpeed = INITIAL_Y_SPEED;
   scrollCounter = 0;
   cameraY = 0;
   createNewBox();

}

function restart() {
   initGameState();
   draw();
}

function draw() {
   if (mode === MODES.GAMEOVER) return;
   drawBackground();
   drawBoxes();
   drawDebris();

   switch (mode) {
      case MODES.BOUNCE: moveAndDetectCollision();
         break;
      case MODES.FALL: updateFallMode();
         break;
   }

   updateCamera();
   window.requestAnimationFrame(draw);
}

function drawBackground() {
   ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
   ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBoxes() {
   boxes.forEach((box) => {
      const { x, y, width, color } = box;
      let newY = INITIAL_BOX_Y - y + cameraY;

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.roundRect(x, newY, width, BOX_HIGHT, [40]);
      ctx.stroke();
      ctx.fill();
   });
}

function createNewBox() {
   boxes[current] = {
      x: 0,
      y: (current + 10) * BOX_HIGHT,
      // y: (current + 10) * BOX_HIGHT,
      width: boxes[current - 1].width,
      color: createStepColor(current)
   }
   xSpeed = Math.abs(xSpeed);
}

function moveAndDetectCollision() {
   const currentBox = boxes[current];
   currentBox.x += xSpeed;

   const isMovingRight = xSpeed > 0;
   const isMovingLeft = xSpeed < 0;

   const hasHitRightSide = currentBox.x + currentBox.width > canvas.width;
   const hasHitLeftSide = currentBox.x === 0;

   // console.log("isMovingLeft: ", isMovingLeft) 
   // console.log("hasHitLeftSide: ", hasHitLeftSide)

   if (isMovingRight && hasHitRightSide || isMovingLeft && hasHitLeftSide) {
      xSpeed *= -1;
   }

   document.addEventListener("keydown", (event) => {
      if (event.key === " " && mode === MODES.BOUNCE) {
         mode = MODES.FALL;
      }
   });
}

function updateFallMode() {
   const currentBox = boxes[current];
   const previousBoxPosition = boxes[current - 1].y;

   currentBox.y -= ySpeed;

   const hasHitBottom = (previousBoxPosition + BOX_HIGHT) === currentBox.y;
   if (hasHitBottom) {
      handleBoxLanding();
   };
}

function handleBoxLanding() {
   const currentBox = boxes[current];
   const previousBox = boxes[current - 1];

   const difference = currentBox.x - previousBox.x;

   if (Math.abs(difference) >= currentBox.width) {
      mode = MODES.GAMEOVER;
      gameOver();
      return;
   }

   createDebris();


   removeOutsideBox();
   //Para incrementar la velocidad
   xSpeed += xSpeed > 0 ? 1 : -1;
   current++;
   score.textContent = current;
   scrollCounter = BOX_HIGHT;
   mode = MODES.BOUNCE;
   createNewBox();
}

function createStepColor(step) {
   if (step === 0) return "white";

   const red = Math.floor(Math.random() * 255);
   const green = Math.floor(Math.random() * 255);
   const blue = Math.floor(Math.random() * 255);

   return `rgb(${red}, ${green}, ${blue})`;
}

function updateCamera() {
   if (scrollCounter > 0) {
      cameraY++;
      scrollCounter--;
   }
}

function removeOutsideBox() {
   const currentBox = boxes[current];
   const previousBox = boxes[current - 1];

   const difference = currentBox.x - previousBox.x;
   currentBox.width -= Math.abs(difference);

   if (currentBox.x < previousBox.x) {
      currentBox.x = previousBox.x;
   }

}

function createDebris() {
   const currentBox = boxes[current];
   const previousBox = boxes[current - 1];

   const difference = currentBox.x - previousBox.x;

   debris.y = INITIAL_BOX_Y - currentBox.y + cameraY;
   debris.width = difference;
   if (currentBox.x > previousBox.x) {
      const debrisX = previousBox.x + previousBox.width;
      debris.x = debrisX;
   } else {
      debris.x = previousBox.x;
   }
}

function drawDebris() {
   const previousBox = boxes[current - 1];
   debris.y += ySpeed;
   
   ctx.beginPath();
   ctx.fillStyle = previousBox.color;
   ctx.roundRect(debris.x, debris.y, debris.width, debris.height, [40]);
   ctx.stroke();
   ctx.fill();
   // ctx.fillRect(debris.x, debris.y, debris.width, debris.height);
}

canvas.onpointerdown = () => {
   if (mode === MODES.GAMEOVER) {
      restart();
   }
   else if (mode === MODES.BOUNCE) {
      mode = MODES.FALL;
   }
}

function gameOver() {
   ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   ctx.font = "bold 20px Arial";
   ctx.fillStyle = "white";
   ctx.textAlign = "center";
   ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
}

restart();

