var WSManager = function(ws) {
    this.websocket = ws;
};

WSManager.prototype.SendCoords = function(id, x, y) {
    var msg = {
        type: 1,
        id: id,
        x: x,
        y: y,
        msg: '',
        c: 0
    }
    this.websocket.send(JSON.stringify(msg));
}

WSManager.prototype.SendText = function(text) {
    var msg = {
        type: 2,
        id: 0,
        x: 0,
        y: 0,
        msg: text,
        c: 0
    }
    ws.send(JSON.stringify(msg));
}
