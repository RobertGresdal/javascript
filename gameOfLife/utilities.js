console.log('utilities.js');

function getCheckMatrix(position,width,height){
	var isTop = (position < width);
	var isLeft = (position % width == 0);
	var isRight = (position % width == width-1);
	var isBottom = (position >= width*height-width);
	var check = [];
	if(!isTop) {
		check.push(-width);
		if(!isLeft) check.push(-width-1);
		if(!isRight) check.push(-width+1);
	}
	if(!isLeft) check.push(-1);
	if(!isRight) check.push(+1);
	if(!isBottom){
		check.push(+width);
		if(!isLeft) check.push(+width-1);
		if(!isRight) check.push(+width+1);
	}
	return check;
}
function compareNumbers(a, b) {
  return a - b;
}
function removeNegatives(){
	for( ; this[0] < 0; ){
		this.shift();
	}
	return this;
}
function removeDuplicates(){
	for( var i=0, end=this.length; i<end; ){
		var self = this[i], next = this[i+1]; 
		if( self == next ){ 
			this.splice(i,1);
			end--;
		} else i++;
	}
	return this;
}
Array.prototype.removeNegatives = removeNegatives;
Array.prototype.removeDuplicates = removeDuplicates;