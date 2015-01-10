/**
* @param {dimension} Array
*/
function VField(dimensions){
  this.dim = (dimensions instanceof Array) ? dimensions : [3,3]; // default size i 3*3
  this.field = [];
  this.zoom = 30;
}

function VFieldNode(dimension){
  this.cells = 0;
  this.strength = 0;
  this.forces = [];

  //this.field = new Array(dimension*dimension).fill(0);
}

function Force(scalar, x, y){
  this.scalar = scalar ? scalar : 0;
  this.x = x ? x : 0;
  this.y = y ? y : 0;

  this._hypotenuse = Math.sqrt(this.x * this.x + this.y * this.y);
}


VField.prototype.render = function(ctx) {
  var i, j,
  pull = 0,
  zoom = this.zoom,
  mid = this.zoom/12,
  size,
  alpha,
  alpha_max_strength = 50
  dim = this.dim;

  ctx.strokeStyle = "#666600";
  ctx.strokeRect(0, 0, dim[0]*zoom, dim[1]*zoom);

  var len = this.field.length;
  for( i = 0; i < len; i++ ){
    x = i % dim[0];
    y = Math.floor( i / dim[1] );
    pull = this.field[i].magnitude;

    ctx.fillStyle = "yellow";
    ctx.fillRect(x*zoom, y*zoom, 1, 1);

    if( this.options.showField ){
      alpha = (Math.log(pull) / alpha_max_strength);
      size = (pull+0).clamp(0,this.zoom*1.1);
      alpha.clamp(0,1);

      ctx.fillStyle = "rgba(0, 255, 0, "+alpha+")";
      ctx.fillRect(x*zoom-size/2, y*zoom-size/2, size, size);
    }
  }
}


VFieldNode.prototype.tick = function(){
  //if( this.cells.length > 4 ){

  //}
}

VFieldNode.prototype.getForces = function(){

}



function Vector(x,y){
  this.x = x;
  this.y = y;
  this.length;
  this.radian;

  this._precision = 1.0e-15;
  var _radian = {
    get : function() {
      return Math.atan2(this.y, this.x);
    },
    set : function(a) {
      var r = this.length;
      this.x = Math.cos(a)*r;
      this.y = Math.sin(a)*r;
    }
  }
  var _length = {
    get : function() {
      var l = Math.sqrt( this.x * this.x + this.y * this.y );
      this._last_length = l;
      return l;
    },
    set : function(length) {
      this._last_length = this._last_length ? this._last_length : this.length;
      var c = length / this._last_length;
      this.x *= c;
      this.y *= c;
    }
  }
  Object.defineProperty(this, "length", _length);
  Object.defineProperty(this, "radian", _radian);
}
Vector.prototype.add = function(vector){
  this.x += vector.x;
  this.y += vector.y;
  return this;
}
Vector.prototype.clone = function() {
  return new Vector(this.x, this.y);
}
Vector.prototype.unit = function() {
  var u = this.clone();
  u.length = 1;
  return u;
}
Vector.prototype.equalTo = function(obj) {
  var c = true,
    p = 1e-15;

  c &= (Math.abs(this.x - obj.x) < p);
  c &= (Math.abs(this.y - obj.y) < p);
  return c;
}
