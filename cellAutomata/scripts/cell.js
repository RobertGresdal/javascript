function Cell() {
	this._property = {};
	/*// Experimental getter and setter didn't work in Opera 26
	this._properties = {
		get [variable](){
			return this._properties[variable];
		},
		set [variable](value){
			return this._properties[variable]=value;
		}
	};*/
}

Cell.prototype.toString = function() {
	return JSON.stringify(this._property);
}

// ```other``` contains other cells closeby
Cell.prototype.tick = function() {}

Cell.prototype.render = function(ctx){
	//console.assert(typeof ctx === "CanvasRenderingContext2D", "Invalid argument given, expected 'CanvasRenderingContext2D'", ctx);
	Console.error("wrong render function called");
}

Particle.prototype = new Cell();			// Inherit Cell
Particle.prototype.constructor = Cell;	// Otherwise instances of Particle would have a constructor of Cell
function Particle(x, y) {
	this.x = x;
	this.y = y;
}
Particle.prototype.tick = function(other) {
	// call _rules on _properties
	// TODO: this is just temporary
	//this.x *= 1.1 % 1;
	//this.y *= 1.1 % 1;

	return output;
}
Particle.prototype.render = function(ctx) {
	ctx.fillStyle = "#888888";
	ctx.fillRect(this.x, this.y, 2, 2);
}

Branch.prototype = new Cell();
Branch.prototype.constructor = Cell;
function Branch(r,length) {
	this.r = r;
	this.length = r;
}
Branch.prototype.tick = function() {

}
