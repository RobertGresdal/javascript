'use strict';

//require(["shims.js"]);

var timer = {
	register:{},
	
	/**
	* Calls callback only is the number of milliseconds have elapsed since last time
	*/
	each : function(ms, callback, reference){
		var key = callback.toString().hashCode();
		if( !(key in this.register) ) this.register[key] = +new Date;
		
		var now = +new Date;
		var diff = now - this.register[key];
		
		if( diff > ms ) {
			// reduce the timer so that it will again wait until the opportune time to run
			this.register[key] = +new Date + ms - diff;
			this.register[key] = Math.min(this.register[key], now+ms);
			
			callback.call(reference);
		}
		//console.log(callback.toString().hashCode());
	}
};


var game = {
	context : null,
	width: null,
	height: null,
	timer: 0,
	runtime: 0,
	debug:1,
	/** ms accuracy of simulation steps performed, 10 means 100 calculations a second, 20 means 50. */
	stepAccuracy: 10,
	/** counter of steps performed during a tick */
	steps:0,
	/** Holds the handle for the requestAnimationFrame clock */
	animFrame: null,
	/** Holds the timestamp from when the last step was finished */
	lastStepRTC:null,
	/** Count upwards towards the rtc for the step counter, so we know when to run a simulation step */
	stepCatchupRTC:null,
	/** Clock for comparing rendering timings with the rtc */
	renderCatchupRTC:null,
	/** Real Time Counter since animation start */
	rtc:0,
	/** Timestamp from when start were called */
	animStart:null,
	/** Holds mouse position over the canvas */
	mouse:null,
	mouseButton:null,
	root:{dots:[],lastdots:[],dotslength:0},
	kdtree:null,
	state:{running:0},
	gamemode:{current:(1+4+16+64),GRAVITY:2,EXPLOSIVE:1,FRICTION:4,MERGE:8,ALLDOTS:16,SELFGRAVITY:32,SELFEXPLOSIVE:64},
	
	init : function(){
		var canvas = document.getElementById('game');
		
		// WINDOW SIZE AND RESIZE
		game.width = document.body.clientWidth - 40;
		game.height = document.body.clientHeight - 80;
		window.addEventListener('resize',function(e){
			game.width = document.body.clientWidth - 40;
			game.height = document.body.clientHeight - 80;
			canvas.width = game.width;
			canvas.height = game.height;
		},false);
		
		canvas.width = game.width;
		canvas.height = game.height;
		this.context = canvas.getContext('2d');
		
		canvas.addEventListener('mousemove',function(e){
			//game.mouse = {x:e.clientX, y:e.clientY};
			game.mouse = {x: e.pageX-this.offsetLeft, y:e.pageY-this.offsetTop};
		},false);
		canvas.addEventListener('mouseout',function(){game.mouse=null},false);
		
		//this.root.dots = [new Dot(10,40),new Dot(80,150),new Dot(350,440)];
		var size = 500;
		this.root.dots = new Array(size);
		for(var i=0;i<size;i++){
			this.root.dots[i] = new Dot(
				Math.random()*game.width, Math.random()*game.height,
				Math.random()/10-0.05,Math.random()/10-0.05,
				0,0
			);
		};
		this.root.dotslength = this.root.dots.length;
		console.debug(this.root.dots[0],this.root.dots[size-1]);
		
		this.kdTree = new kdTree(this.root.dots, game.distance, ['x','y']);
		
		var self = this;
		/*canvas.addEventListener('click',function(e){
			this.mouse.button1 = e.
			var nearest = self.kdTree.nearest({'x':self.mouse.x,'y':self.mouse.y},5);
			for(var i=0,j=nearest.length;i<j;i++){
				nearest[i][0].size = 4;
				nearest[i][0].color = 'red';
			}
			timer.each(50,function(e){
				this.root.dots.push(new Dot(e.clientX, e.clientY, 0,0,0,0));
			},this);
		},false);*/
		self.mouseButton=[0, 0, 0, 0, 0, 0, 0, 0, 0];
		document.body.onmousedown = function(evt) { 
		  ++self.mouseButton[evt.button];
		}
		document.body.onmouseup = function(evt) {
		  --self.mouseButton[evt.button];
		}
		//console.log(this.root.dots);
		//this.animFrame = window.requestAnimationFrame(game.tick);
		//this.animator.add(this.loop
	},
	
	/**
	* Calls game logic and simulation
	* @function
	* @private
	*/
	tick : function(t) {
		//timer.calleach(1000,function(){console.log(Math.random(5))});
		var self=this;
		// If we have less than 200 particles, update the tree each tick, else do it every 100ms
		// There was a bug where the tree wasn't updated to the real amount of dots when enoug had
		// merged so there were less dots than the tree thought. It didn't happen when there were
		// more dots in existence than asked for in nearest()
		/*if(self.root.dotslength <= 200){
			this.kdTree = new kdTree(this.root.dots, game.distance, ['x','y']);
		} else */timer.each(100,function(){
			this.kdTree = new kdTree(this.root.dots, game.distance, ['x','y']);
		},this);
		
		// IF MOUSE BUTTON PRESSED, CREATE PARTICLES
		timer.each(50,function(){
			if( this.mouse && this.mouseButton[0]>0 ){
				var dot = new Dot(this.mouse.x, this.mouse.y, Math.random()-0.5,Math.random()-0.5, 0,0);
				//console.log(dot);
				this.root.dots.push(dot);
				this.root.dotslength = this.root.dots.length;
			};
		},self);
		
		var nearest = self.mouse==null ? [] : 
			self.kdTree.nearest({'x':self.mouse.x,'y':self.mouse.y}, Math.min(self.root.dotslength-5,100));
		var diff = self.root.lastdots.diff(nearest);

		// restore old dots
		for(var i=0,j=diff.length;i<j;i++){
			var dot = diff[i][0];
			//dot.size = 3;
			dot.color = 'black';
			dot.ax = 0;
			dot.ay = 0;
		}
		
		// color new dots
		for(var i=0,j=nearest.length;i<j;i++){
			var dot = nearest[i][0];
			//dot.size = 5;
			dot.color = 'green';
			
			// Move away
			if(this.gamemode.current & this.gamemode.GRAVITY){
				var GRAVITY_MODIFIER = 0.05;
				if(dot.distance(dot,self.mouse) < 100*100){
					dot.ax = (self.mouse.x-dot.x)/self.width*GRAVITY_MODIFIER;
					dot.ay = (self.mouse.y-dot.y)/self.height*GRAVITY_MODIFIER;
				}
			} 
			else if(this.gamemode.current & this.gamemode.EXPLOSIVE) {
				if(dot.distance(dot,self.mouse) < 50*50){
					//dot.ax = (dot.x-self.mouse.x)/self.width;
					//dot.ay = (dot.y-self.mouse.y)/self.height;
					var dx = dot.x-self.mouse.x;
					var dy = dot.y-self.mouse.y;
					dot.ax = 1/Math.min(dx*dx*dx,100);
					dot.ay = 1/Math.min(dy*dy*dy,100);
				}
			}
		}
		self.root.lastdots = nearest.splice(0);
		
		
		
		for(var i=0,d=null;d=this.root.dots[i];i++){
			// DOT GRAVITY
			var colliders = [];
			if(this.gamemode.current & this.gamemode.ALLDOTS) {
				var neardot = self.kdTree.nearest({'x':d.x,'y':d.y}, 2);
				for(var k=0,m=null;m=neardot[k];k++){
					var nd = m[0];
					if( nd==d ) continue;
					//timer.each(500,function(){console.log(nd)},this);
					var distance = nd.distance(nd,d);
					if(distance < 1 && this.gamemode.current & this.gamemode.ALLDOTS){
						var ix = this.root.dots.indexOf(nd);
						this.root.dots.splice(ix,1); // nd is never d, so parent loop should not fail
						this.root.dotslength = this.root.dots.length;
						d.size += 1;
					} else if(distance < 200){
						//console.log('COLLISION',d,nd);
						
						if(this.gamemode.current & this.gamemode.SELFEXPLOSIVE) {
							nd.ax = (nd.x-d.x)/self.width;
							nd.ay = (nd.y-d.y)/self.height;
							nd.color='red';
							d.color = 'purple';
							d.ax = -nd.ax;
							d.ay = -nd.ay;
						} else if(this.gamemode.current & this.gamemode.SELFGRAVITY){
							nd.ax = (d.x-nd.x)/self.width;
							nd.ay = (d.y-nd.y)/self.height;
							nd.color='red';
							d.color = 'purple';
							d.ax = -nd.ax;
							d.ay = -nd.ay;
						}
						
						if(colliders.indexOf(nd)<0)colliders.push(nd);
					}
				}
			}
			
			d.tick(t,game);
			
			d.ax = 0;
			d.ay = 0;
			d.color = 'black';
			/*for(var i=0,j=colliders.length;i<j;i++){
				var nd = colliders[i];
				nd.color='green';
				nd.ax=0;
				nd.ay=0;
			}*/
		}
		
		if(this.runtime > 50000){
			this.pause();
		}
	},
	
	/**
	* Performs the drawing to screen
	* @function
	* @private
	*/
	render : function() {
		var c = this.context;
		c.fillStyle = 'white';
		c.fillRect(0,0,game.width,game.height);
		
		/*c.beginPath();
		c.moveTo(100,150);
		c.lineTo(390,50);
		c.stroke();*/
		
		c.fillStyle = 'black';
		c.font = '9pt DejaVu Sans';
		c.fillText(this.runtime, 10, 20);
		c.fillText('Particles: '+this.root.dotslength, 10, 40);
		
		if(this.mouse)
		c.fillText(this.mouse.x +", "+this.mouse.y, 10,40);
		
		//c.fillText(this.kdTree.balanceFactor(),10,80);
		
		for(var i=0,d;d=this.root.dots[i];i++){
			c.fillStyle = d.color;
			c.fillRect(d.x-d.size/2, d.y-d.size/2, d.size,d.size);
		}
	},
	
	start : function(){
		game.animStart = +new Date;
		game.lastStepRTC = game.animStart;
		game.state.running = 1;
		game.animFrame = requestAnimationFrame(this.step);
		//console.log(game.animStart);
	},
	pause : function(){
		game.state.running = 0;
		cancelAnimationFrame(game.animFrame);
	},
	resume: function(){
		game.state.running = 1;
		game.animFrame = requestAnimationFrame(this.step);
	},
	step : function(timestamp){
		var now = +new Date;
		var diff = (now - game.lastStepRTC);
		
		game.runtime += diff;
		
		game.render();
		
		game.steps=0;
		while( game.timer < (game.runtime - game.stepAccuracy) ){
			game.tick(game.stepAccuracy);
			game.timer += game.stepAccuracy;
			game.steps++;
		}
		
		/*var progress;
		if (start === null) start = timestamp;
		progress = timestamp - start;
		if (progress > this.stepAccuracy){
			progress - this.stepAccuracy;
			
		}*/
		game.lastStepRTC = +new Date;
		return requestAnimationFrame(game.step);
	},
	distance : function(a,b){
		return Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2);
	}
	
	
};

document.addEventListener('DOMContentLoaded', function () {
  game.init();
  game.start();
});