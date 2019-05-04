var ChatSystem = function() {
  this.chatItems = [];
};

ChatSystem.prototype.addItem = function(text) {
    if(this.chatItems.length < 42) {
        this.chatItems.push(text);
    } else {
        this.chatItems.splice(0,1);
        this.chatItems.push(text);
    }
};

ChatSystem.prototype.draw = function() {
    /*
    for(var i = this.chatItems.length-1; i >= 0; i--) {
        text(this.chatItems[i], 520, 15 + (42-i) * 12);
    }
    for(var i = 0; i < this.chatItems.length; i++) {
        text(this.chatItems[i], 520, 15 + (42-i) * 12);
    }
    */

    for(var i = 0; i < 42; i++) {
        if( i < this.chatItems.length ) {
            text(this.chatItems[i], 520, 15 + i * 12);
        }
    }
}