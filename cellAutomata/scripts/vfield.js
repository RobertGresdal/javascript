/**
* Vector field
* @param {Object|Topology} topology The topology of the items
*/
function VField(topology) {
  //this.width = 100;
  //this.height = 100;
  this.grid = {x:25,y:13};
  this.zoom = 50;
  this.field = null;
  this.topo = topology;

  this.clear();
}

/**
* Resolve takes a function to smooth out point values
*/
VField.prototype.resolve = function(F) {
  // TODO: use F to calculate force spread from items. currently use simple attraction
  var oldField = this.field;
  this.clear();
  var i, len = this.topo.size, item;
  for( i = 0; i < len; i++) {
    item = topo.getItem(i);
    var x = Math.round(item.x/this.grid.x);
    var y = Math.round(item.y/this.grid.y);
    this.field[x[y]] += item.mass;
  }
}

VField.prototype.clear = function() {
  this.field = new Array(this.grid.x);
  //this.field.map(Math.zero);
  for (var i=0, len=this.grid.x; i < len; i++) {
    this.field[i] = new Array(this.grid.y);
  }
}

VField.prototype.render = function(ctx) {
  var i, j, zoom = this.zoom;
  for( i = 0; i < this.grid.x; i++) {
    for( j = 0; j < this.grid.y; j++) {
      ctx.fillStyle = 'rgba(0, 255, 0, .25)';
      ctx.fillRect(i*zoom, j*zoom, 2, 2)
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
