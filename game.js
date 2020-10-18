// Konstanter som kan endres for å påvirke spillet
var GAME_INITIAL_SPEED = 2;
var GAME_SPEED_INCREASE = 0.001;
var OBSTACLE_OPENING = 300;
var OBSTACLE_DISTANCE = 400;
var HELICOPTER_MAX_SPEED = 5;
var HELICOPTER_ACCELERATION = 0.3;

// Initializing canvas
var canvas = document.querySelector("#canvas");
var ctx = canvas.getContext("2d");

// Initializing media files
var engineSound = new Audio("assets/helicopter.mp3");
engineSound.loop = true;
var crashSound = new Audio("assets/crash.mp3");
var helicopterImgRight = new Image();
helicopterImgRight.src = "assets/helicopter-right.png";
var helicopterImgLeft = new Image();
helicopterImgLeft.src = "assets/helicopter-left.png";
var helicopterImg = helicopterImgRight;

// Rendering start screen
var highScore = localStorage.getItem("highScore") || 0;
ctx.fillStyle = "hsl(203, 68%, 95%)";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.font = "bold 26px Consolas, monospace";
ctx.textAlign = "center";
ctx.textBaseline = "top";
ctx.fillStyle = "#444";
ctx.fillText("Score: 0 m      High: " + Math.floor(highScore) + " m", canvas.width / 2, 15);
ctx.font = "bold 20px Consolas, monospace";
ctx.textBaseline = "middle";
ctx.fillText("Guide the helicopter through the obstacles.", canvas.width / 2, 140);
ctx.fillText("Steer using the left and right arrow key.", canvas.width / 2, 170);
ctx.font = "bold 24px Consolas, monospace";
ctx.fillText("Press Space to start.", canvas.width / 2, 250);
helicopterImg.onload = function () {
    ctx.drawImage(helicopterImg, 270, 350, 100, 67);
};

var isPlaying = false;
var leftKeyDown = false;
var rightKeyDown = false;

function startGame() {
    // Position, speed and acceleration of the helicopter
    var xPos = 270;
    var yPos = 350;
    var xSpeed = 0;
    var xAcceleration = 0;

    engineSound.play();

    // Constructor function to generate a new obstacle
    function Obstacle() {
        this.xPos = Math.random() * (canvas.width - OBSTACLE_OPENING);
        this.yPos = -200;

        this.draw = function () {
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#000";
            ctx.strokeRect(-10, this.yPos, this.xPos + 10, 20);
            ctx.strokeRect(this.xPos + OBSTACLE_OPENING, this.yPos, canvas.width, 20);
            ctx.fillStyle = "#fdd813";
            ctx.fillRect(-10, this.yPos, this.xPos + 10, 20);
            ctx.fillRect(this.xPos + OBSTACLE_OPENING, this.yPos, canvas.width, 20);
        }
    }

    var obstacles = [];
    var newObstacleIn = 0;

    var gameSpeed = GAME_INITIAL_SPEED;
    var score = 0;

    function frame() {
        // Gradually increasing game speed
        gameSpeed += GAME_SPEED_INCREASE;
        score += gameSpeed / 10;
        collision = false;

        for (var i = 0; i < obstacles.length; i++) {
            var obstacle = obstacles[i];

            // Moving the obstacles downwards
            obstacle.yPos += gameSpeed;

            // Checking if the helicopter has crashed into an obstacle
            if (!((yPos + 67 - 5 < obstacle.yPos || yPos + 5 > obstacle.yPos + 20) ||
                (xPos + 5 > obstacle.xPos && xPos + 100 - 5 < obstacle.xPos + OBSTACLE_OPENING))) {
                collision = true;
            }
        }

        newObstacleIn -= gameSpeed;
        if (newObstacleIn <= 0) {
            // Generating new obstacle
            obstacles.push(new Obstacle);
            newObstacleIn = OBSTACLE_DISTANCE;
        }

        // Drawing background
        ctx.fillStyle = "hsl(203, 68%, 95%)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Drawing all obstacles
        for (var i = 0; i < obstacles.length; i++) {
            obstacles[i].draw();
        }

        // Drawing helicopter
        ctx.drawImage(helicopterImg, xPos, yPos, 100, 67);

        // Tegner score og high score
        ctx.font = "bold 26px Consolas, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = "#444";
        ctx.fillText("Score: " + Math.floor(score) + " m      High: " + Math.floor(highScore) + " m", canvas.width / 2, 15);

        // Accelerating the helicopter if an arrow key is held down while max speed is not achieved
        if (leftKeyDown && xSpeed > -HELICOPTER_MAX_SPEED) {
            xAcceleration = -HELICOPTER_ACCELERATION;
        } else if (rightKeyDown && xSpeed < HELICOPTER_MAX_SPEED) {
            xAcceleration = HELICOPTER_ACCELERATION;
        }

        // Simulating air resistance if neither of the arrow keys are held down
        else if (xSpeed > 0) {
            xAcceleration = -0.05;
        } else if (xSpeed < 0) {
            xAcceleration = 0.05;
        }

        // Updating speed and acceleration of helicopter
        xSpeed += xAcceleration;
        xPos += xSpeed;

        // Makes the helicopter appear at the opposite side if an edge is reached
        if (xPos < -100) {
            xPos = canvas.width;
        } else if (xPos > canvas.width) {
            xPos = -100;
        }

        // On collision, stop the game and show end screen
        if (collision) {
            isPlaying = false;

            engineSound.pause();
            engineSound.currentTime = 0;
            crashSound.play();

            ctx.font = "bold 32px Consolas, monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("GAME OVER!", canvas.width / 2, 140);
            ctx.font = "bold 24px Consolas, monospace";
            ctx.fillText("Press Space to play again.", canvas.width / 2, 200);

            // Checking for new high score
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore);
            }
        }

        else {
            requestAnimationFrame(frame);
        }
    }

    isPlaying = true;
    requestAnimationFrame(frame);
}


// EVENT LISTENERS:

window.addEventListener("keydown", function (e) {
    // Left arrow key
    if (e.keyCode == 37) {
        leftKeyDown = true;

        // Snur helikopterbildet mot venstre
        helicopterImg = helicopterImgLeft;
    }

    // Right arrow key
    else if (e.keyCode == 39) {
        rightKeyDown = true;

        // Snur helikopterbildet mot høyre
        helicopterImg = helicopterImgRight;
    }

    // Space bar
    else if (e.keyCode == 32 && !isPlaying) {
        startGame();
    }
});

window.addEventListener("keyup", function (e) {
    // Left arrow key
    if (e.keyCode == 37) {
        leftKeyDown = false;
    }

    // Right arrow key
    else if (e.keyCode == 39) {
        rightKeyDown = false;
    }
});