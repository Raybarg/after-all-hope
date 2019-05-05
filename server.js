#!/usr/bin/env node
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
var curId = 0;

wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.id = wss.getUniqueID();
    ws.on('close', () => {
        // Send all clients message about disconnected remote user
        var msg = {
            type: 900,
            id: ws.id,
            x: 0,
            y: 0,
            msg: new Date().toTimeString(),
            c: wss.clients.size
        };
        wss.clients.forEach((client) => {
            if (client !== ws) {
                client.send(JSON.stringify(msg));
            }
        });
        console.log('Client disconnected');
    });
    
    ws.on('error', () => console.log('errored'));
    ws.onmessage = function(event) {
        var msg = JSON.parse(event.data);
        switch(msg.type) {
            case 0:
                break;
            case 1:
                msg.c = wss.clients.size;
                msg.id = ws.id;

                wss.clients.forEach((client) => {
                    client.send(JSON.stringify(msg));
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
        };
        client.send(JSON.stringify(msg));
    });
}, 1000);

