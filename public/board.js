var gameMap = new Array(100*100);
var tileSize = 32;
var dragging = 0;
var globalX = 0;
var globalY = 0;
var imgTiles;
var board;
var checker;
var whoosh;
var whoosh2;
var ding;
var damessage;
var checkers = [];
var input;
var chatmessage;
var chatSystem;
var heartbeatLastTime;
var wsManager;
var numOfClients;

var HOST = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(HOST);
var el = document.getElementById('server-time');

ws.onmessage = function (event) {
    var msg = JSON.parse(event.data);
    numOfClients = msg.c;
    switch(msg.type) {
        case 0:
            damessage = msg.msg;
            heartbeatLastTime = millis();
            break;
        case 1:
            changeChecker(msg.id, msg.x, msg.y);
            break;
        case 2:
            chatSystem.addItem(msg.msg);
            break;
        case 3:
            checkers.push(new Checker(msg.id, msg.x, msg.y));
            break;
    }
};

function changeChecker(id, x, y) {
    for (var i = checkers.length-1; i >= 0; i--) {
        var p = checkers[i];
        if (p.id == id) {
            p.x = x;
            p.y = y;
        }
    }
}

function preload() {
    board = loadImage("assets/board.png");
    checker = loadImage("assets/checker.png");

    soundFormats('ogg');
    whoosh = loadSound('assets/woosh1.ogg');
    whoosh2 = loadSound('assets/woosh2.ogg');
    ding = loadSound('assets/ding1.ogg');

    whoosh.playMode('restart');
    whoosh.setVolume(0.1);
    whoosh2.playMode('restart');
    whoosh2.setVolume(0.1);
    ding.playMode('restart');
    ding.setVolume(0.1);

    imgTiles = loadImage("assets/PathAndObjects.png");
    
}

function setup() {
    numOfClients = 0;
    damessage = '';
    chatmessage = '';
    this.chatSystem = new ChatSystem();
    this.wsManager = new WSManager(ws);
    createCanvas(1024, 530);
    //input = createInput('');

    for (var x = 1; x < 99; x++) {
        for (var y = 1; y < 99; y++ ) {
            gameMap[x+y*100] = 255;
        }
    }

    for (var x = 30; x < 60; x++) {
        for (var y = 30; y < 60; y++ ) {
            gameMap[x+y*100] = 0;
        }
    }
    for (var x = 31; x < 59; x++) {
        for (var y = 31; y < 59; y++ ) {
            gameMap[x+y*100] = 254;
        }
    }

}

function draw() {
    background(128);
    fill(64);
    noStroke();
    rect(0,510,1024,530);
    fill(255);
    image(board, 0,0);
    for (var i = checkers.length-1; i >= 0; i--) {
        var p = checkers[i];
        p.display();
    }
    text(chatmessage, 520,10);
    chatSystem.draw();

    if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
        moveOffset(0, -1);
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
        moveOffset(0, 1);
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
        moveOffset(1, 0);
    } 
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
        moveOffset(-1, 0);
    }
    var wall;
    var grass;
    var water;
    wall = imgTiles.get(63, 256, 32, 32);
    grass = imgTiles.get(32, 352, 32, 32);
    water = imgTiles.get(96, 320, 32, 32);

    for (x = 0; x < 100; x++) {
        for (y = 0; y < 100; y++) {
            if (x*tileSize < width && y*tileSize < height)  {
                if (gameMap[(x+globalX)+(y+globalY)*100]===255) {
                    image(grass, x*tileSize, y*tileSize);
                } else if(gameMap[(x+globalX)+(y+globalY)*100]===254) {
                    image(water, x*tileSize, y*tileSize);
                } else {
                    image(wall, x*tileSize, y*tileSize);
                }
            }
        }
    }
    var s = "coords: " + mouseX + ", "  + mouseY + "   [Clients: " + numOfClients + "]";
    var temp = textWidth(s);
    text(s, (1024/2)-(temp/2),525);

    if (this.heartbeatLastTime < (millis()-4000)) {
        fill(color('red'));
        var errorMsg = "Disconnected";
        temp = textWidth(errorMsg);
        text(errorMsg, 1024-temp,525);
    } else {
        fill(255);
        temp = textWidth(damessage);
        text(damessage, 1024-temp,525);
    }
    fill(255);

    text("After All Hope!",1,525);
}

function mouseClicked() {

}

function mouseDragged() {
    for (var i = checkers.length-1; i >= 0; i--) {
        var p = checkers[i];
        if (dragging < 0) {
            if ((mouseX > p.x && mouseX-50 < p.x && mouseY > p.y && mouseY-50 < p.y) ) {
                whoosh2.play();
                dragging = p.id;
            }
        }
        if (dragging == p.id) { 
            p.x = mouseX-25;
            p.y = mouseY-25;
            dragging = p.id;
            this.wsManager.SendCoords(p.id, p.x, p.y);
        }
    }
    
}

function keyPressed() {
    if (keyCode === ENTER) {
        this.wsManager.SendText(input.value());
        input.value('');
    }
}

function mousePressed() {
    dragging = -1;
}

function mouseReleased() {
    for (var i = checkers.length-1; i >= 0; i--) {
        var p = checkers[i];

        if (mouseX > p.x && mouseX-50 < p.x && mouseY > p.y && mouseY-50 < p.y && dragging >= 0) {
            p.x = constrain(p.x, 1, 970);
            p.y = constrain(p.y, 1, 460);
            whoosh.play();
            dragging = -1;
            this.wsManager.SendCoords(p.id, p.x, p.y);
        } else if (dragging < 0) {
            if(mouseX > 0 && mouseX < 510 && mouseY > 0 && mouseY < 510) {
                if (mouseX > p.x && mouseX-50 < p.x && mouseY > p.y && mouseY-50 < p.y) {
                    ding.play();
                }
            }
        }
    }
}

function moveOffset(x, y) {
    globalX += x;
    globalY += y;

    globalX = constrain(globalX, 0, 100-width/tileSize);
    globalY = constrain(globalY, 0, 100-height/tileSize);
    
}