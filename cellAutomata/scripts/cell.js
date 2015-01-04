function Cell(copy) {
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
	if( copy ){
		this.merge(copy);
	}
}

Cell.prototype.merge = function(obj2) {
	for (var attrname in obj2) {
		this[attrname] = obj2[attrname];
	}
	return this;
}

Cell.prototype.toString = function() {
	return JSON.stringify(this._property);
}

// ```other``` contains other cells closeby
Cell.prototype.tick = function() {}

Cell.prototype.distance = function(item, squared) {
	var x, y, dist2;

	x = item.x - this.x;
	y = item.y - this.y;
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
function Particle(x, y, mass, vx, vy) {
	this.x = x;
	this.y = y;
	this.mass = mass ? mass : Math.random()*60000 + 30000;
	this.vx = vx ? vx : (Math.random()-0.5) * .2;
	this.vy = vy ? vy : (Math.random()-0.5) * .2;
	this._lastAppliedForce = {};
	this._forces = [];

	this._drawSize = Math.sqrt(this.mass-30000) / 16;
}
Particle.prototype.tick = function(t) {
	// call _rules on _properties
	// TODO: this is just temporary

	this.applyForce(t);
	this._forces = [];
}
Particle.prototype.withinBounds = function(bounds) {
	if( this.x < bounds.x || this.x > (bounds.x+bounds.width) ) return false;
	if( this.y < bounds.y || this.y > (bounds.y+bounds.height) ) return false;
	return true;
}
Particle.prototype.render = function(ctx) {
	ctx.fillRect(this.x-this._drawSize/2, this.y-this._drawSize/2, this._drawSize/2, this._drawSize/2);
}
Particle.prototype.addForce = function(pos, F) {
	//this._forces.push( {"vector":vector, "F":F} );
	//var vector = {"x": this.x - pos.x, "y": this.y - pos.y};
	//var vector = {"vx": pos.x - this.x, "vy": pos.y - this.y, "F":F};
	var vector = {"vx": this.x - pos.x, "vy": this.y - pos.y, "F":F};
	this._forces.push(vector);
	//this._forces.push({"vector":vector, "F":F});
}

Particle.prototype.applyForce = function(t) {
	t = 1;
	var Fx = 0, Fy = 0, f, i, len = this._forces.length, deg;
	var ax,ay,vx,vy;

	for( i = 0; i < len; i++) {
		f = this._forces[i];
		c = Math.sqrt(f.vy*f.vy + f.vx*f.vx);
		Fx += f.F * f.vx / c;
		Fy += f.F * f.vy / c;
	}
	/*deg = f.vector.y / f.vector.x;
	Fx += Math.cos(deg) * F_sq;
	Fy += Math.sin(deg) * F_sq;*/
	//this._lastAppliedForce = {"Fx":Fx, "Fy":Fy};

	ax = -Fx / this.mass;
	ay = -Fy / this.mass;

	vx = this.vx + ax * t ;
	vy = this.vy + ay * t ;

	// s = (v * t) + (a * t * t)/2
	this.x += (vx * t) + (ax * t * t)/2
	this.y += (vy * t) + (ay * t * t)/2
	this.vx = vx;
	this.vy = vy;
	this.ax = ax;
	this.ay = ay;
}
/**
 * [Energy–momentum relation](http://en.wikipedia.org/wiki/Energy–momentum_relation)
 * E^2 = (pc)^2 + (m_0c^2)^2
*/
Particle.prototype.inverse = function(number){
	// TODO: add possibility of spawning several less energetic particles
	// E = .5 * mass * v^2
	// so E / x = (.5 * mass * v^2) / x
	// Actually it should have -E...
	var p = new Particle(this.x, this.y, this.mass, -this.vx, -this.vy);
	return p;
}
