/**
* @param {dimension} Array
*/
function VField(dimensions, topology){
  this.dim = (dimensions instanceof Array) ? dimensions : [3,3]; // default size i 3*3
  //this.field = [];
  this.field = {};
  this.field.mass = [];
  this.field.mass.length = this.dim[0]*this.dim[1]; // new Array(dimensions[0]*dimensions[1]).fill(0);
  this.field.mass.fill(0);
  this.zoom = 30;
  this.options = {"showField":true};

  this._topology = topology;

  /*for(var i=0;i<this.field.length;i++){
    this.field[i] = {"mass":0};
  }*/
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
  offset,
  size,
  alpha,
  alpha_max_strength = 50,
  dim = this.dim;

  ctx.strokeStyle = "#666600";
  ctx.strokeRect(0, 0, dim[0]*zoom, dim[1]*zoom);

  var len = this.field.mass.length;
  for( i = 0; i < len; i++ ){
    x = i % dim[0];
    y = Math.floor( i / dim[0] );
    pull = this.field.mass[i];

    ctx.fillStyle = "rgb(255,255,0,0.5)";
    ctx.fillRect(x*zoom, y*zoom, 1, 1);

    if( this.options.showField ){
      alpha = (Math.log(pull) / alpha_max_strength);
      size = Math.log(pull*pull/10);
      size.clamp(0,this.zoom*1.1);
      alpha.clamp(0,1);

      ctx.fillStyle = "rgba(0, 255, 0, "+alpha+")";
      //ctx.fillStyle = "green";
      offset = (zoom - size)/2;
      ctx.fillRect(x*zoom+offset, y*zoom+offset, size, size);
    }
  }
}

VField.prototype.resolve = function() {
  var cells = this._topology.items,
  len = cells.length,
  flen = this.field.mass.length,
  zoom = this.zoom,
  cell, i, fx, fy, fi;

  // Recalculate mass for field
  // For each cell, add its mass to the field
  for(i = 0; i < len; i++){
    cell = cells[i];
    // Abort early if cells exist outside bounds
    if( cell.x < 0 || cell.x > this.dim[0]*zoom)continue;
    if( cell.y < 0 || cell.y > this.dim[1]*zoom)continue;

    // Find which field the cell is located in
    fx = Math.floor( cell.x / zoom );//.clamp(0, this.dim[0]);
    fy = Math.floor( cell.y / zoom );//.clamp(0, this.dim[1]);
    //force = new Force(fx, fy, cell.mass);
    fi = (fx + fy * this.dim[0]);
    if( 0 <= fi && fi < flen ){
      // If the mass property doesn't exist, make it

      //this.field.items[fi].push(cell);
      this.field.mass[fi] += cell.mass;
      // FIXME: ah, wait. we were supposed to add FORCES to the field
    }
    //debugger;
  }
}

VField.prototype.propagate = function() {
  // do a flawed propagation first, just move directly x and y
  var field = this.field.mass,
    newField = [],//this.field.mass.slice(0),
    len = (this.dim[0] * this.dim[1]),
    w = this.dim[0],
    i, j, mi;
  newField.length = field.length;
  newField.fill(0);
  var m  = [-w-1, -w, -w+1,
              -1,  0,    1,
             w-1,  w,  w+1];
  var md = [ 12, 16, 12,
             16,  4, 16,
             12, 16, 12];

  for(i = 0; i < len; i++){
    // If the current field has mass
    if( field[i] > 1e-15 ){
      // For each surrounding field
      for(j = 0; j < m.length; j++){
        mi = i + m[j];// m[j]%len for looping in y direction?
        if(mi < 0)continue;
        if(mi >= len)continue;

        // Propagate some of its mass (should rename this to "pull" or something to indicate what we're propagating is the gravitational pull wave)
        newField[mi] += field[i] / md[j]; // FIXME divide by amount set from different matrix that corresponds to how much it should get from the distance
      }
    }
  }
  this.field.mass = newField;
}

function resolve_wrong_1(cell) {
  var cells = this._topology.cells,
    len = cells.length,
    zoom = this.zoom,
    cell, force, i, fx, fy;
  for(i = 0; i < len; i++){
    cell = cells[i];
    // Find position relative to the field position
    fx = ( cell.x % zoom ) - zoom/2;
    fy = ( cell.y % zoom ) - zoom/2;
    force = new Force(fx, fy, cell.mass);
    //c[i]
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
