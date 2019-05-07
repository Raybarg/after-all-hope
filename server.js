#!/usr/bin/env node
/*jslint node: true */
"use strict";
let express = require('express');
let SocketServer = require('ws').Server;
let path = require('path');
let helper = require('./shared/helper.js');
let player = require('./shared/player.js');
let packet = require('./shared/packet.js');

let PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'public/index.html');
const server = express()
    .use(express.static('public'))
    .use((req, res) => res.sendFile(INDEX) )
    .listen(PORT, () => {
        setupServer();
        console.log(`Listening on ${ PORT }`);
    });
const wss = new SocketServer({ server });
let players = [];
let gameMap = new Array(100*100);

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.id = packet.getUniqueID();
    
    players.push(new player(ws.id, 1, 1)); // Add client to list

    ws.send(packet.identify(ws.id)); // Tell client who they are

    // Send info of all players to new client
    players.forEach((oPlayer) => {
        if (oPlayer.connected) ws.send(packet.coordinate(oPlayer.id, oPlayer));
    });
    
    ws.on('close', () => {
        // Send all clients message about disconnected remote user
        var msg = packet.disconnect(ws.id);
        wss.clients.forEach((client) => {
            if (client !== ws) {
                client.send(msg);
            }
        });
        let playerIdx = players.findIndex(pl => pl.id === ws.id);
        players[playerIdx].connected = false;
        console.log('Client disconnected');
    });
    
    ws.on('error', () => console.log('errored'));
    ws.onmessage = function(event) {
        var msg = JSON.parse(event.data);
        switch(msg.type) {
            case 0:
                break;
            case 1:         // Movement request
                let playerIdx = players.findIndex(pl => pl.id === ws.id);
                if (playerIdx >= 0) {
                    players[playerIdx].moveOffset(gameMap, msg.x, msg.y);
                }
                let resp = packet.coordinate(ws.id, players[playerIdx]);
                wss.clients.forEach((client) => {
                    client.send(resp);
                });
                break;

            case 2:
                msg.c = wss.clients.size;
                msg.id = ws.id;
                wss.clients.forEach((client) => {
                    client.send(JSON.stringify(msg));
                });
                break;
        }
    };
});
// Server heartbeat
setInterval(() => {
    var msg = packet.heartbeat(wss.clients.size);
    wss.clients.forEach((client) => {
        client.send(msg);
    });
}, 1000);

function setupServer() {
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
