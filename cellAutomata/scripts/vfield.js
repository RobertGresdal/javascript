/**
* Vector field
* @param {Object|Topology} topology The topology of the items
*/
function VField(topology) {
  //this.width = 100;
  //this.height = 100;
  this.topo = topology;
  this.zoom = 50;
  this.grid = {
    "x":Math.floor(this.topo.bounds.width/this.zoom),
    "y":Math.floor(this.topo.bounds.height/this.zoom)
  };
  this.field = null;
  this.clear();
}

VField.prototype.tick = function(t) {
  this.resolve(this.topo);
}

/**
* Resolve takes a function to smooth out point values
*/
VField.prototype.resolve = function(topology) {
  //if ( ! topology.items || topology.items.length == 0 ) return this;

  // TODO: use F to calculate force spread from items. currently use simple attraction
  var i, j, k, gx, gy, col, items, len, bounds, strength;
  for ( i = 0; i < this.grid.x; i++ ){
    //col = topology.items[i];
    for ( j = 0; j < this.grid.y; j++ ) {
      gx = i * this.zoom - this.zoom/2;
      gy = j * this.zoom - this.zoom/2;
      bounds = {"x":gx-50, "y":gy-50, "width":100, "height":100};
      items = topology.find(bounds);

      /*items.filter( function(item, i, a){
        idistance(gx,gy,true) < 50*50 )return true;
        return false;
      } );*/
      //this.field[i][j] = items.length; // TODO: later, open up for varying masses

      function red_strength(p_F, item, i, arr){
        var dist_sq, F,
          intensity = 20000;

        dist_sq = item.distance(arr.pos,true);
        F = intensity * ( 1 / Math.max(1,dist_sq) );
        F += p_F;
        // ^-- IMPORTANT: Don't make this a vector, we're adding up the
        //  gravity from all particles around this area. If this were made
        //  a vector, it could cancel itself out and defeat the purpose.

        //if( dist_sq === NaN || F === NaN ) console.log(item, dist_sq, F);
        return F;
      };
      items.pos = {x:gx,y:gy};
      strength = items.reduce(red_strength, 0);
      this.field[i][j] = strength; // log() of strength is ~324.25 at MAX_VALUE
    }
  }
  return this;
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
    mid = this.zoom/8,
    alpha,
    alpha_max_strength = 10;
  for( i = 0; i < this.grid.x; i++) {
    for( j = 0; j < this.grid.y; j++) {
      x = this.field[i][j];
      if( x !== undefined ) {
        // log of MAX_VALUE is ~< 325
        // Restrict alpha to log(x)==alpha_max_strength
        alpha = (Math.log(x) / alpha_max_strength);
        alpha.clamp(0,1);
      } else {
        alpha = 0;
      }
      //if(x > 0)console.log("rgba(0, 255, 0, "+x+")");
      ctx.fillStyle = "rgba(0, 255, 0, "+alpha+")";
      ctx.fillRect(i*zoom-mid, j*zoom-mid, mid, mid)
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
