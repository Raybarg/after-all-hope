var gameMap = new Array(100*100);
var tileSize = 32;
var dragging = 0;
var globalX = 0;
var globalY = 0;
var imgTiles;
var knight;
var damessage;
var input;
var chatmessage;
var chatSystem;
var heartbeatLastTime;
var wsManager;
var numOfClients;
var playerX = 1;
var playerY = 1;
var remotePlayers = [];
var localID = '';

var HOST = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(HOST);
var el = document.getElementById('server-time');

ws.onmessage = function (event) {
    let rPid = -1;
    var msg = JSON.parse(event.data);
    switch(msg.type) {
        case 0:
            numOfClients = msg.c;
            damessage = msg.msg;
            heartbeatLastTime = millis();
            break;
        case 1:
            // Coordinate update
            rPid = remotePlayers.findIndex(rp => rp.id === msg.id);
            if (rPid >= 0) {
                remotePlayers[rPid].x = msg.x;
                remotePlayers[rPid].y = msg.y;
                globalX = msg.globalX;
                globalY = msg.globalY;
            } else {
                remotePlayers.push(msg);
            }
            break;
        case 2:
            // Chatbubble update
            rPid = remotePlayers.findIndex(rp => rp.id === msg.id);
            if (rPid >= 0) {
                remotePlayers[rPid].msg = msg.msg;
                remotePlayers[rPid].msgTime = millis();
            } else {
                msg.msgTime = millis();
                remotePlayers.push(msg);
            }
            break;
        case 3:
            //
            break;
        case 100:
            // Server telling who I am
            localID = msg.id;
            remotePlayers.push(msg);
            break;
        case 900:
            // Disconnected user
            rPid = remotePlayers.findIndex(rp => rp.id === msg.id);
            if (rPid >= 0) {
                remotePlayers.splice(rPid, 1);
            }
            break;
    }
};

function preload() {
    imgTiles = loadImage("assets/PathAndObjects.png");
    knight = loadImage("assets/knight.png");
}

function setup() {
    numOfClients = 0;
    damessage = '';
    chatmessage = '';
    this.chatSystem = new ChatSystem();
    this.wsManager = new WSManager(ws);
    createCanvas(1024, 800);
    input = createInput('');
    input.id('chatInput');
    input.input(chatInput);
    input.size(500,20);
    input.position(1, height+20);

    var x = 0;
    var y = 0;

    for (x = 0; x < 100; x++) {
        for (y = 0; y < 100; y++ ) {
            gameMap[x+y*100] = 0;
        }
    }

    for (x = 1; x < 99; x++) {
        for (y = 1; y < 99; y++ ) {
            gameMap[x+y*100] = 255;
        }
    }

    for (x = 30; x < 60; x++) {
        for (y = 30; y < 60; y++ ) {
            gameMap[x+y*100] = 0;
        }
    }
    for (x = 31; x < 59; x++) {
        for (y = 31; y < 59; y++ ) {
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

    textSize(12);
    textAlign(CENTER);
    //text("this is you!!!!", playerX*32 - globalX*32 + 16, playerY*32 - globalY*32 + 45);
    //image(knight, playerX*32 - globalX*32 ,playerY*32 - globalY*32);

    remotePlayers.forEach(rP => {
        if (rP.msg !== "") {
            textSize(16);
            textStyle(BOLD);
            text(rP.msg, rP.x*32 - globalX*32 + 16, rP.y*32 - globalY*32 - 25);
            if (millis() - rP.msgTime > 5000) rP.msg = "";
            textSize(12);
            textStyle(NORMAL);
        }
        text(rP.id, rP.x*32 - globalX*32 + 16, rP.y*32 - globalY*32 - 10);
        image(knight, rP.x*32 - globalX*32, rP.y*32 - globalY*32);
    });

    textAlign(LEFT);
    text(`p: ${playerX},${playerY}`, 10,490);
    text(`g: ${globalX},${globalY}`, 10,500);

    var s = `You are: ${localID}  |  coords ${mouseX}, ${mouseY}   [Clients: ${numOfClients}]`;
    //var s = "coords: " + mouseX + ", "  + mouseY + "   [Clients: " + numOfClients + "]";
    var temp = textWidth(s);
    text(s, (1024/2)-(temp/2), height);

    if (this.heartbeatLastTime < (millis()-4000)) {
        fill(color('red'));
        var errorMsg = "Disconnected";
        temp = textWidth(errorMsg);
        text(errorMsg, 1024-temp, height);
    } else {
        fill(255);
        temp = textWidth(damessage);
        text(damessage, 1024-temp, height);
    }
    fill(255);

    text("After All Hope! v0.0.0a",1,height);
}

function mouseClicked() {

}

function mouseDragged() {
    
}

function keyPressed() {
    if (!isChatFocused()) {
        let moveX = 0;
        let moveY = 0;
        if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
            moveY = -1;
        }
        if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
            moveY = 1;
        }
        if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
            moveX = 1;
        } 
        if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
            moveX = -1;
        }
        if (moveX != 0 || moveY != 0) {
            this.wsManager.SendCoords(moveX, moveY);            
        }
    }
    if (keyIsDown(ENTER)) {
        if (!isChatFocused()) {
            let inp = document.getElementById('chatInput');
            inp.focus();
        } else {
            this.wsManager.SendText(input.value());
            input.value('');
            document.activeElement.blur();
        }
    }
}

function chatInput() {
    
}
function isChatFocused() {
    return document.activeElement.id === 'chatInput';
}

function mousePressed() {

}

function mouseReleased() {

}

