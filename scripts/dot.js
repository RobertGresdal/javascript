function Dot(x,y,vx,vy,ax,ay){
	this.x=x;//, y:y, vx:vx, vy:vy, ax:ax, ay:ay, size:2, color:'black';
	this.y=y;
	this.vx=vx;
	this.vy=vy;
	this.ax=ax;
	this.ay=ay;
	this.size = 3;
	this.color = 'black';
	this.speed_2=(x*x+y*y);
	this.max = {mx:this.size*vx*vx, my:this.size*vy*vy};
	this.wallHit = false;
}
Dot.prototype.toMessage = function(){
	return {
		x:this.x, y:this.y, 
		vx:this.vx, vy:this.vy,
		ax:this.ax, ay:this.ay
	};
};
Dot.prototype.tick = function(ms,game){
	var friction = game.gamemode.FRICTION & game.gamemode.current;
	var wallHit = false;
	var direction = {x:0,y:0};
	
	// PREVENT WALL BLEED
	var wall = this.calculateWallhit({width:game.width,height:game.height});
	wallHit = wall.hit;
	direction = wall.direction;
	
	if( friction && wallHit){
		if(this.wallHit != wallHit){
			this.max.mx = (this.size*this.vx*this.vx);
			this.max.my = (this.size*this.vy*this.vy);
		}
		this.ax *= direction.x;
		this.ay *= direction.y;
		this.vx *= 0.95;
		this.vy *= 0.95;
	}

	
	this.acceleration(ms);
	
	
	this.speed_2=(this.x*this.x+this.y*this.y);
	game.energy += (0.5 * this.size * this.speed_2)/1000000;
	this.wallHit = wallHit;
}

Dot.prototype.distance = function(a, b) {
	return Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2);
}
/**
* Performs a coordinate transform on all particles
*/
Dot.transform = function(coords, dots) {
	if(! dots instanceof Array) return -1;
	
	for(var i=0,d=null;d=dots[i];i++){
		d.transform(coords);
	}
}
/**
* Performs a coordinate transform on a particle
*/
Dot.prototype.transform = function(coords){
	this.x += coords.x;
	this.y += coords.y;
}


Dot.prototype.acceleration = function(t){
	this.vx += this.ax*t;
	this.x += this.vx*t;
	
	this.vy += this.ay*t;
	this.y += this.vy*t;
}

Dot.prototype.calculateWallhit = function(bounds){
	var wallHit = false;
	var direction = {x:0,y:0};
	
	// PREVENT WALL BLEED
	if(this.x < 10){
		direction.x = 1;
		this.x = Math.max(this.x,10);
		this.ax = this.x/bounds.width;
		wallHit=true;
	}else if(this.x > bounds.width-10){
		direction.x = -1;
		this.x = Math.min(this.x,bounds.width-10);
		this.ax = Math.abs((this.x-bounds.width)/bounds.width);
		wallHit=true;
	};
	if(this.y < 10){
		direction.y = 1;
		this.y = Math.max(this.y,10);
		this.ay = this.y/bounds.height;
		wallHit=true;
	} else if(this.y > bounds.height-10){
		direction.y = -1;
		//this.vy *= -1;
		this.y = Math.min(this.y,bounds.height-10);
		this.ay = Math.abs((this.y-bounds.height)/bounds.height);
		wallHit=true;
	};
	
	return {hit:wallHit,direction:direction};
}

/*
Dot.prototype.direction = function(a, b) {
	var total = {
		x:(Math.abs(a.x)+Math.abs(b.x)),
		y:(Math.abs(a.y)+Math.abs(b.y))}
	;
	var distance = {
		x:(a.x/total.x),
		y:(
}
*/
/*Dot.prototype.tick = function(ms,game){
	var t = ms/1000;
	var dots = game.root.dots;
	var force = [0,0];
	for(var i=0,d=null;d=dots[i];i++){
		// if coords are different, add to cumulative drag. All masses are similar at the moment.
//		if( d.x != this.x || d.y != this.y ){
		if( d != this ){
			var dx = this.x - d.x;
			var dy = this.y - d.y;
			var r = Math.sqrt(dx*dx + dy*dy);
			force[0] += 1/dx; // TODO: check for rx==0 or ry==0
			force[1] += 1/dy;
			
			//var pos = this.pos;
			timer.calleach(250,function(){
				console.log(
					'x:'+d.x, 
					'y:'+d.y,
					'r'+r,
					'dx:'+dx+' dy:'+dy, 
					'force:'+force);
			},this);
		}
	}
	this.pos[4] = force[0]/dots.count;
	this.pos[5] = force[1]/dots.count;
	
	this.last.x = this.x;
	this.last.y = this.y;
	
	/*this.pos[0] = this.pos[0]+(this.pos[2]*this.pos[4]*t);
	this.pos[1] = this.pos[1]+(this.pos[3]*this.pos[5]*t);*//*
	this.pos[2] += this.pos[4]*t;
	this.pos[3] += this.pos[5]*t;
	this.pos[0] += this.pos[2]*t;
	this.pos[1] += this.pos[3]*t;
}*/


