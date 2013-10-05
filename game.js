'use strict';

var game = {
	context : null,
	timer: 0,
	runtime: 0,
	stepAccuracy: 20,
	animFrame: null,
	lastStepRTC:null,
	/** Real Time Counter since animation start */
	rtc:0,
	animStart:null,
	
	init : function(){
		this.context = document.getElementById('game').getContext('2d');
		//this.animFrame = window.requestAnimationFrame(game.tick);
		//this.animator.add(this.loop
	},
	
	/**
	* Calls game logic and simulation
	* @function
	* @private
	*/
	tick : function(t) {
		
	},
	
	/**
	* Performs the drawing to screen
	* @function
	* @private
	*/
	render : function() {
		var c = this.context;
		c.fillStyle = 'white';
		c.fillRect(0,0,400,300);
		
		c.beginPath();
		c.moveTo(100,150);
		c.lineTo(390,50);
		c.stroke();
		
		c.fillStyle = 'black';
		c.font = '14pt DejaVu Sans';
		c.fillText(this.runtime, 10, 20);
		//console.log("foo");
	},
	
	start : function(){
		game.animStart = +new Date;
		game.lastStepRTC = game.animStart;
		game.animFrame = requestAnimationFrame(this.step);
		console.log(game.animStart);
	},
	pause : function(){
		game.animFrame.cancelAnimationFrame();
	},
	resume: function(){
	
	},
	step : function(timestamp){
		if(!game.foo){
			console.log(game.timer, game.runtime, timestamp);
			//console.log(timestamp);
			console.log(Math.round(timestamp));
			game.foo=1;
		}
		
		game.timer += Math.min(timestamp,200);
		game.runtime += game.timer;
		
		game.render();
		
		while( game.timer > game.stepAccuracy ){
			game.tick(game.stepAccuracy);
			game.timer -= game.stepAccuracy;
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