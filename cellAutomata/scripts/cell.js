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
	this._rules = [];

	// TODO: remove intial property. used only for testing
	this._property.x = Math.random();
	this._property.y = Math.random();
}

Cell.prototype.toString = function(){
	return JSON.stringify(this._property);
}

Cell.prototype.tick = function(input){
	// call _rules on _properties
	// TODO: this is just temporary
	this._property.x *= 1.1 % 1;
	this._property.y *= 1.1 % 1;

	return output;
}

Cell.prototype.render = function(ctx){
	console.assert(typeof context !== 'CanvasRenderingContext2D', 'Invalid argument given, expected "CanvasRenderingContext2D"', context);

	ctx.fillRect(-1,-1,2,2);
}

Particle.prototype = new Cell();			// Inherit Cell
Particle.prototype.constructor = Cell;	// Otherwise instances of Particle would have a constructor of Cell
function Particle(x, y) {
	this._property.x = x;
	this._property.y = y;
}
