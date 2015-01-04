/**
* Vector field
* @param {Object|Topology} topology The topology of the items
*/
function VField(topology) {
  //this.width = 100;
  //this.height = 100;
  this.topo = topology;
  this.zoom = 15;
  this.options = {"showVField":true};
  this.grid = {
    "x":Math.floor(this.topo.bounds.width/this.zoom),
    "y":Math.floor(this.topo.bounds.height/this.zoom)
  };
  this.field = null;
  this.clear();
}

VField.prototype.tick = function(t) {
  //this.clear();
  //this.spread();
}

/**
* Resolve takes a function to smooth out point values
*/
VField.prototype.resolve = function(topology) {
  //if ( ! topology.items || topology.items.length == 0 ) return this;

  // TODO: use F to calculate force spread from items. currently use simple attraction
  // TODO: should store vectors that are inverse from where the source is, so
  // when applying we can simply add them to the items within it (check that distance
  // for each of x and y is below "zoom" as that dictates the resolution)
  var i, j, k, gx, gy, col, items, len, bounds, force;
  var xlen = this.field.length;
  var ylen = this.field[0].length;
  for ( i = 0; i < xlen; i++ ){
    //col = topology.items[i];
    for ( j = 0; j < ylen; j++ ) {
      gx = i * this.zoom;
      gy = j * this.zoom;
      //bounds = {"x":gx-200, "y":gy-200, "width":400, "height":400};
      bounds = {"x":gx, "y":gy};
      items = topology.find(bounds);

      /*items.filter( function(item, i, a){
        idistance(gx,gy,true) < 50*50 )return true;
        return false;
      } );*/
      //this.field[i][j] = items.length; // TODO: later, open up for varying masses

      //items.pos = {"x":gx,"y":gy};
      var init = {"x":gx,"y":gy, "F":0};
      force = items.reduce(this.reduce_strength, init);
      this.field[i][j] = force.F;

      // Add the force on the item
      /*items.map(function(item, index, array){
        array[index].addForce(this, this.F);
      }, init);*/
      // NO. Each item shall add forces from each 8 nodes around it
    }
  }
  return this;
}

VField.prototype.vectorGravity = function(topology) {
  // for each item
  //  find closest node
  // add forces from 8 nodes around it
  // apply forces

  var i, j, gx, gy, items, bounds;
  var xlen = this.field.length;
  var ylen = this.field[0].length;
  for ( i = 0; i < xlen; i++ ){
    for ( j = 0; j < ylen; j++ ) {
      gx = i * this.zoom;
      gy = j * this.zoom;
      bounds = {"x":gx, "y":gy, "width":1, "height":1};
      //bounds = {"x":gx, "y":gy};
      items = topology.find(bounds);

      // Add the force on the item
      var init = {"x":gx,"y":gy, "F":this.field[i][j]};
      items.map(function(item, index, array){
        array[index].addForce(this, this.F);
      }, init);
    }
  }
}
/*
VField.prototype.getForces = function(x, y) {
  var forces = [], i, j;
  var top = Math.max(0, y-1),
    bottom = Math.min(this.grid.y, y+1),
    left = Math.max(0, x-1),
    right = Math.min(this.grid.x, x+1);
  for( i = left; i < right; i++ ){
    for( j = top; j < bottom; j++){
      //forces.push(this.field[i][j]);
      //forces[i][j]
    }
  }
  return forces;
}*/

/*
VField.prototype.vectorGravity = function(x, y, strength, time) {
  // Perform the second pass and change every items speed
  var i, j;
  //, k, gx, gy, col, items, len, bounds, strength;
  for ( i = 0; i < this.grid.x; i++ ){
    for ( j = 0; j < this.grid.y; j++ ) {
      gx = i * this.zoom - this.zoom/2;
      gy = j * this.zoom - this.zoom/2;
      bounds = {"x":gx-50, "y":gy-50, "width":100, "height":100};
      items = topology.find(bounds);

      items.map(function(item, index, array){
        item.applyForce(x, y, this.field[i][j], time);
      });
    }
  }
}*/

/**
* item must have x,y properties. item2 must have x, y and mass.
*/
VField.prototype.calcForce = function(item, item2) {
  var dist_sq, F;
  dist_sq = item.distance(item2,true);
  F = item2.mass * ( 1 / Math.max(1,dist_sq) );
  return F;
}
VField.prototype.reduce_strength = function (last, item, i, arr) {
  var dist_sq, F;
  dist_sq = item.distance(last,true);
  //if( dist_sq > 625 ){
    F = item.mass * ( 1 / Math.max(1,dist_sq) );
    last.F += F;
  //}
  // ^-- IMPORTANT: Don't make this a vector, we're adding up the
  //  gravity from all particles around this area. If this were made
  //  a vector, it could cancel itself out and defeat the purpose.

  return last;
}

VField.prototype.clear = function() {
  //console.log(this.grid.x);
  this.field = new Array(this.grid.x);
  for (var i = 0, len = this.grid.x; i < len; i++) {
    this.field[i] = new Array(this.grid.y);
    this.field[i].fill(0);
    //console.log(this.field[i], this.field[i].length, this.field[i][0]);
  }
  //console.log("this.field", this.field);
  return this;
}

VField.prototype.render = function(ctx) {
  var i, j,
    x = 0,
    zoom = this.zoom,
    mid = this.zoom/12,
    size,
    alpha,
    alpha_max_strength = 50;
  for( i = 0; i < this.grid.x; i++) {
    for( j = 0; j < this.grid.y; j++) {
      x = this.field[i][j];
      if( x == 0 || x === undefined ) {
        alpha = 0;
        size = 0;
      } else {
        // log of MAX_VALUE is ~< 325
        // Restrict alpha to log(x)==alpha_max_strength
        alpha = (Math.log(x) / alpha_max_strength);
        size = (x+0).clamp(0,this.zoom*1.5);
        alpha.clamp(0,1);
      }
      //if(x > 0)console.log("rgba(0, 255, 0, "+x+")");
      if( this.options.showVField ){
        ctx.fillStyle = "rgba(0, 255, 0, "+alpha+")";
        ctx.fillRect(i*zoom-size/2, j*zoom-size/2, size, size);
      }

      //ctx.fillStyle = "red";
      //ctx.fillRect(i*zoom, j*zoom, 1, 1 );
    }
  }
}

/*
VField.prototype.insert(item) {
  if( item instanceof Array) {
    var len = item.length;

    for(var i = 0; i < len; i++) {
      this.items.push(item);
    }
  } else {
    this.items.push(item);
  }
}
*/
