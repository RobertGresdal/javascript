function Dot(x,y,vx,vy,ax,ay){
	this.x=x;//, y:y, vx:vx, vy:vy, ax:ax, ay:ay, size:2, color:'black';
	this.y=y;
	this.vx=vx;
	this.vy=vy;
	this.ax=ax;
	this.ay=ay;
	this.size = 2;
	this.color = 'black';

	/*this.pos = {'x':x,'y':y,'vx':vx,'vy':vy,'ax':ax,'ay':ay};
	this.size = 2;
	this.color = 'black';*/
	//this.lastpos = {'x':x, 'y':y};
}

Dot.prototype.tick = function(ms,game){
	if(this.x < 0 || this.x > game.width) this.vx *= -1;
	//this.vx *= this.ax;
	this.x += this.vx*ms;
	
	if(this.y < 0 || this.y > game.height) this.vy *= -1;
	//this.vy *= this.ay;
	this.y += this.vy*ms;
}
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


Dot.prototype.distance = function(a, b) {
	return Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2);
};