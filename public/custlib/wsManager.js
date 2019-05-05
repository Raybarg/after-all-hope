var WSManager = function(ws) {
    this.websocket = ws;
};

WSManager.prototype.SendCoords = function(x, y) {
    var msg = {
        type: 1,
        id: '',
        x: x,
        y: y,
        msg: '',
        c: 0
    };
    this.websocket.send(JSON.stringify(msg));
};

WSManager.prototype.SendText = function(text) {
    var msg = {
        type: 2,
        id: '',
        x: 0,
        y: 0,
        msg: text,
        c: 0
    };
    ws.send(JSON.stringify(msg));
};
