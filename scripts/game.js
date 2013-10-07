'use strict';

//require(["shims.js"]);

var timer = {
	register:{},
	
	/**
	* Calls callback only is the number of milliseconds have elapsed since last time
	*/
	calleach : function(ms, callback, reference){
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
	stepAccuracy: 10,
	/** ms accuracy of simulation steps performed, 10 means 100 calculations a second, 20 means 50. */
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
	mouse:[null,null],
	root:{dots:[]},
	kdtree:null,
	
	init : function(){
		game.width = document.body.clientWidth - 20;
		game.height = document.body.clientHeight - 20;
	
		var canvas = document.getElementById('game');
		canvas.width = game.width;
		canvas.height = game.height;
		this.context = canvas.getContext('2d');
		
		canvas.addEventListener('mousemove',function(e){
			game.mouse = [e.clientX, e.clientY];
		},false);
		canvas.addEventListener('mouseout',function(){game.mouse=[null,null]},false);
		
		
		//this.root.dots = [new Dot(10,40),new Dot(80,150),new Dot(350,440)];
		var size = 1500;
		this.root.dots = new Array(size);
		for(var i=0;i<size;i++){
			this.root.dots[i] = new Dot(
				Math.random()*game.width, Math.random()*game.height,
				Math.random(),Math.random(),
				Math.random(),Math.random()
			);
		};
		console.debug(this.root.dots[0],this.root.dots[size-1]);
		
		var distance = function(a,b){
			return Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2);
		};
		this.kdTree = new kdTree(this.root.dots, distance, ['x','y']);
		
		var self = this;
		canvas.addEventListener('click',function(e){
			var nearest = self.kdTree.nearest({'x':self.mouse[0],'y':self.mouse[1]},5);
			for(var i=0,j=nearest.length;i<j;i++){
				nearest[i][0].size = 4;
				nearest[i][0].color = 'red';
			}
			
			//console.log(nearest);
			//console.log(nearest);
			//nearest[0][0].size = 4;
			//nearest[0][0].color = 'red';
			/*for(var i=0,j=nearest.count;i<j;i++){
				nearest[i][0].color = 'red';
				nearest[i][0].size = 4;
			}
			console.log(nearest[0][0].size);*/
		},false);
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
		
		for(var i=0,d;d=this.root.dots[i];i++){
			d.tick(t,game);
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
		c.font = '14pt DejaVu Sans';
		c.fillText(this.runtime, 10, 20);
		c.fillText(this.steps, 10, 40);
		//console.log("foo");
		
		c.fillText(this.mouse[0] +", "+this.mouse[1], 10,60);
		
		for(var i=0,d;d=this.root.dots[i];i++){
			c.fillStyle = d.color;
			c.fillRect(d.x,d.y, d.size,d.size);
		}
	},
	
	start : function(){
		game.animStart = +new Date;
		game.lastStepRTC = game.animStart;
		game.animFrame = requestAnimationFrame(this.step);
		//console.log(game.animStart);
	},
	pause : function(){
		game.animFrame.cancelAnimationFrame();
	},
	resume: function(){
	
	},
	step : function(timestamp){
		var now = +new Date;
		var diff = (now - game.lastStepRTC);
		
		game.runtime += diff;
		
		if(game.debug){
			console.log(game.timer, game.runtime, timestamp);
			//console.log(timestamp);
			console.log(Math.round(timestamp));
			game.debug=0;
		}
		
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
	}
	
	
};

document.addEventListener('DOMContentLoaded', function () {
  game.init();
  game.start();
});