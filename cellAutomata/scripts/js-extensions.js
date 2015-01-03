String.prototype.hashCode = function(){
    var hash = 0, i, char;
    if (this.length == 0) return hash;
    for (i = 0, l = this.length; i < l; i++) {
        char  = this.charCodeAt(i);
        hash  = ((hash<<5)-hash)+char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return !(a.indexOf(i) > -1);});
};
Array.prototype.unique = function() {
	return this.filter( function(value, index, self) {
		return self.indexOf(value) === index;
	} );
};
/*
Math.prototype.sign = function(d) {
	return d<0 ? -1 : 1;
};
Math.prototype.zero = function(d) {
  return 0;
};
*/
Array.prototype.fill = function( val ) {
  var len = this.length, i;
  for( i = 0; i < len; i++){
    this[i] = val;
  }
  return this;
}

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};