function Cell() {
	this._property = {};
	this.x = 0;
	this.y = 0;
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

Cell.prototype.distance = function(coords, squared) {
	var x, y, dist2;

	x = coords.x - this.x;
	y = coords.y - this.y;
	dist2 = (x * x) + (y * y);

	if( squared ){
		return dist2;
	} else {
		return Math.sqrt(dist2);
	}
}

Cell.prototype.render = function(ctx){
	//console.assert(typeof ctx === "CanvasRenderingContext2D", "Invalid argument given, expected 'CanvasRenderingContext2D'", ctx);
	Console.error("wrong render function called");
}

Particle.prototype = new Cell();			// Inherit Cell
Particle.prototype.constructor = Cell;	// Otherwise instances of Particle would have a constructor of Cell
function Particle(x, y) {
	this.x = x;
	this.y = y;
	this.dx = Math.random()-0.5;
	this.dy = Math.random()-0.5;
}
Particle.prototype.tick = function(t) {
	// call _rules on _properties
	// TODO: this is just temporary
	this.x += this.dx * t;
	this.y += this.dy * t;
}
Particle.prototype.withinBounds = function(bounds) {
	if( this.x < bounds.x || this.x > (bounds.x+bounds.width) ) return false;
	if( this.y < bounds.y || this.y > (bounds.y+bounds.height) ) return false;
	return true;
}
Particle.prototype.render = function(ctx) {
	ctx.fillRect(this.x-1, this.y-1, 2, 2);
}

Branch.prototype = new Cell();
Branch.prototype.constructor = Cell;
function Branch(r,length) {
	this.r = r;
	this.length = r;
}
Branch.prototype.tick = function() {

}
