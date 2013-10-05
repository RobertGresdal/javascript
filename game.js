'use strict';

require("shims.js");

var game = {
	context : null,
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
		c.fillText(this.steps, 10, 40);
		//console.log("foo");
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