/*jslint node: true */
"use strict";
let express = require('express');
let SocketServer = require('ws').Server;
let path = require('path');
let Checker = require('./shared/checker.js');

let PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'public/index.html');
const server = express()
    .use(express.static('public'))
    .use((req, res) => res.sendFile(INDEX) )
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));
const wss = new SocketServer({ server });
const checkers = [];
var curId = 0;
for (var i = 0; i < 8; i++) checkers.push(new Checker(curId++, 15, i*61 + 15));
for (var i = 0; i < 8; i++) checkers.push(new Checker(curId++, 75, i*61 + 15));
for (var i = 0; i < 8; i++) checkers.push(new Checker(curId++, 136, i*61 + 15));

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('close', () => console.log('Client disconnected'));
    ws.on('error', () => console.log('errored'));
    ws.onmessage = function(event) {
        var msg = JSON.parse(event.data);

        switch(msg.type) {
            case 0:
                break;
            case 1:
                msg.x = constrain(msg.x, 1, 970);
                msg.y = constrain(msg.y, 1, 460);

                checkers[msg.id].x = msg.x;
                checkers[msg.id].y = msg.y;

                msg.c = wss.clients.size;

                wss.clients.forEach((client) => {
                    if (client !== ws) {
                        client.send(JSON.stringify(msg));
                    }
                });
                break;
            case 2:
                msg.c = wss.clients.size;
                wss.clients.forEach((client) => {
                    client.send(JSON.stringify(msg));
                });
                break;
        }
    }
    for(var i = 0; i < 24; i++) {
        var msg = {
            type: 3,
            id: checkers[i].id,
            x: checkers[i].x,
            y: checkers[i].y,
            msg: '',
            c: wss.clients.size
        };
        ws.send(JSON.stringify(msg));
    }
    

});

function constrain(number, min, max) {
    if (number < min ) number = min;
    if (number > max ) number = max;
    return number;
}

setInterval(() => {
    wss.clients.forEach((client) => {
        var msg = {
            type: 0,
            id: 0,
            x: 0,
            y: 0,
            msg: new Date().toTimeString(),
            c: wss.clients.size
        }
        client.send(JSON.stringify(msg));
        //client.send(new Date().toTimeString());
    });
}, 1000);

