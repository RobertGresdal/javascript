function Cell(){
	/*this._properties = {
		get [variable](){
			return this._properties[variable];
		},
		set [variable](value){
			return this._properties[variable]=value;
		}
	};*/
	this._rules = [];

	// TODO: remove intial property. used only for testing
	this.x = Math.random();
	this.y = Math.random();
}
Cell.prototype.toString = function(){
	return JSON.stringify(this._properties);
};
Cell.prototype.tick = function(input){
	// call _rules on _properties
	// TODO: this is just temporary
	this.property.x *= 1.1 % 1;
	this.property.y *= 1.1 % 1;

	return output;
}
Cell.prototype.render = function(ctx){
	console.assert(typeof context !== 'CanvasRenderingContext2D', 'Invalid argument given, expected "CanvasRenderingContext2D"', context);

	ctx.fillRect(-1,-1,2,2);
}
// Because I keep forgetting how:
//
// Cat.prototype = new Mammal(); 			// Inherit Mammal
// Cat.prototype.constructor=Mammal;	// Otherwise instances of Cat would have a constructor of Mammal
// function Cat(name){
// 	this.name = name;
//};
