var Checker = function(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
};

Checker.prototype.display = function() {
    image(checker, this.x, this.y);
};
