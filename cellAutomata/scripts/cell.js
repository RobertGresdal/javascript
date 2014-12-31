function Cell() {
	this.properties = {};
	this.rules = [];
}
Cell.prototype.toString = function() {
	return JSON.stringify(this.properties);
};
Cell.prototype.tick = function(ms, game) {
	// call each rule
}
