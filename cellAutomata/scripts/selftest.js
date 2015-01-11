/*function assertEqual(a,b){
  if( a instanceof Object && a.equalTo ){
    return a.equalTo(b);
  } else if( a === b ){
  } else {
    console.assert("a === b", a, b);
  }
}
function assertUnequal(a,b){
  if( a !== b ){ }
  else {
    console.assert("a !== b", a, b);
  }
}*/

/*
* Vector testing
*/
a = new Vector(0,1);
console.assert(a.radian === Math.PI/2, a);

b = new Vector(1,0);
console.assert(b.radian === 0, b);

c = new Vector(2,3);
c.add(a).add(b);
console.assert(c.x === 3, c);
console.assert(c.y === 4, c);
console.assert(c.length === 5, c);
console.assert(c.direction === a.direction);
console.assert(c.direction === b.direction);

a.radian = Math.PI;
console.assert(a.x-1 < 1e-15, a);
console.assert(a.y   < 1e-15, a);
//console.assert(a.y === 1.2246467991473532e-16, a);

a = new Vector(1,2);
b = new Vector(1,2);
console.assert(a.equalTo(b), a, b);
console.assert(b.equalTo(a), b, a);
console.assert( ! a.equalTo(c), a, c);

u = a.unit();
console.assert((1-u.length) < 1e-15, u);
console.assert(u.x === 0.4472135954999579, u);
console.assert(u.y === 0.8944271909999159, u);
console.assert(u.radian === 1.1071487177940904, u);
/*
* Force testing
*/
