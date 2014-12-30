"use strict";

function Game() {
	this.context = null;
	this.width = document.body.clientWidth - 400;
	this.height = document.body.clientHeight - 80;
	this.timer = 0;
	this.runtime = 0;
	this.debug = 1;
	/** ms accuracy of simulation steps performed,
	* 10 means 100 calculations a second, 20 means 50. */
	this.stepAccuracy = 10;
	/** counter of steps performed during a tick */
	this.steps = 0;
	/** Holds the handle for the requestAnimationFrame clock */
	this.animFrame = null;
	/** Holds the timestamp from when the last step was finished */
	this.lastStepRTC = null;
	/** Counts the ms between the last 5 frames */
	this.fpsCounter = [0,0,0,0,0];
	this.fpsIndex = -1;
	/** Count upwards towards the rtc for the step counter, so we know when to
	* run a simulation step */
	this.stepCatchupRTC = null;
	/** Clock for comparing rendering timings with the rtc */
	this.renderCatchupRTC = null;
	/** Real Time Counter since animation start */
	this.rtc = 0;
	/** Timestamp from when start were called */
	this.animStart = null;
	/** Holds mouse position over the canvas */
	this.mouse = null;
	this.mouseButton = null;
	this.root = {
		cells: [],
		cellsLastTick: [],
		numCells: 0
	};
	this.state = { running:0 };
	this.gameflags = {
		DUMMY: 1,
	};
	this.settings = { numOfCells:500, showFPSGraph:true };
	this.topo = new Topology(0, 0, this.width, this.height);
}

Game.prototype.init = function() {
		var self = this,
			canvas = document.querySelector("#game");
		//this.fpsCounter = new Array(100);

		// WINDOW SIZE AND RESIZE
		canvas.width = this.width;
		canvas.height = this.height;
		this.context = canvas.getContext("2d");

		window.addEventListener("resize", function(e) {
			this.width = document.body.clientWidth - 400;
			this.height = document.body.clientHeight - 80;
			canvas.width = this.width;
			canvas.height = this.height;
			this.topo.update();
		}, false);

		// Capture mouse movement
		canvas.addEventListener("mousemove", function(e) {
			this.mouse = { x:e.pageX - this.offsetLeft, y:e.pageY - this.offsetTop };
		}, false);
		canvas.addEventListener("mouseout", function() { this.mouse = null; }, false);

		/**
		* Initialize cells
		*/
		this.root.cells = new Array(this.settings.numOfCells);
		for (var i = 0; i < this.settings.numOfCells; i++ ) {
			this.root.cells[i] = new Cell();
		};
		this.root.numCells = this.root.cells.length;

		// Track state of mousbuttons as a read-on-demand variable
		self.mouseButton = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
		document.body.onmousedown = function(evt) {
		  self.mouseButton[evt.button]++;
		};
		document.body.onmouseup = function(evt) {
		  self.mouseButton[evt.button]--;
		};
}

	/**
	* Calls game logic and simulation
	* @function
	* @private
	*/
Game.prototype.tick = function(t) {
		//timer.calleach(1000,function(){console.log(Math.random(5))});
		var self = this;
		this.energy = 0;

		//topo.update();
	},

	/**
	* Performs the drawing to screen
	* @function
	* @private
	*/
Game.prototype.render = function() {
		var c = this.context;
		c.fillStyle = "#333";
		c.fillRect(0, 0, this.width, this.height);

		c.fillStyle = "black";
		c.font = "9pt DejaVu Sans";

		this.topo.render(c);

		// FPS Graph
		if ( this.settings.showFPSGraph ){
			c.strokeStyle = "#333";
			c.lineWidth = 1;
			c.fillStyle = "black";
			var graphLeft = (this.width - 205),
				graphTop = 5,
				graphBottom = 10,
				graphHeight = 50,
				graphWidth = 200;


			for (var i = 0, e = this.fpsCounter.length; i < e; i++) {
				c.moveTo(graphLeft + i * 2 + 0.5, graphBottom);
				c.lineTo(graphLeft + i * 2 + 0.5, graphBottom + this.fpsCounter[i]);
				c.stroke();
			}
		};

		// FPS counter (text)
		var fps = this.fpsCounter.reduce(function(a, b) { return a ? (a + b) : b }) / this.fpsCounter.length;
		c.fillText((1000/fps).toLocaleString(), 10, 20);

		c.fillText(this.runtime, 10, 40);
		c.fillText('Particles: '+this.root.dotslength, 10, 60);

		//c.fillText('energy: '+this.energy.toLocaleString(), 10, 80);
		if(this.mouse)c.fillText(this.mouse.x +", "+this.mouse.y, 10,80);

		//c.fillText(this.kdTree.balanceFactor(),10,80);
		for(var i=0,d;d=this.root.cells[i];i++){
			// Fetch color settings and size of circle
			c.fillStyle = d.color;
			var size = Math.sqrt(d.size);

			// Draw a filled circle to represent each particle
			c.beginPath();
			c.arc(d.x, d.y, size, 0,Math.PI*2, false);
			c.closePath();
			c.fill();
			// Draw rectangle
			//c.fillRect(d.x-size/2, d.y-size/2, size, size);
		}
}




Game.prototype.toggleRun = function() {
		if( this.state.running == 1){
			this.pause();
		} else {
			if( ! this.animStart ){
				this.start();
			} else {
				this.resume();
			}
		}
	}

Game.prototype.start = function(){
		console.log('Starting simulation');
		this.animStart = +new Date;
		this.lastStepRTC = this.animStart;
		this.state.running = 1;
		this.animFrame = requestAnimationFrame(this.step);
		//console.log(this.animStart);
}
Game.prototype.pause = function(){
		this.state.running = 0;
		cancelAnimationFrame(this.animFrame);
}
Game.prototype.resume = function(){
		this.state.running = 1;
		this.animFrame = requestAnimationFrame(this.step);
}
Game.prototype.step = function(timestamp){
		var now = +new Date;
		var diff = (now - this.lastStepRTC);

		this.runtime += diff;

		this.render();

		this.steps=0;
		while( this.timer < (this.runtime - this.stepAccuracy) ){
			this.tick(this.stepAccuracy);
			this.timer += this.stepAccuracy;
			this.steps++;
		}

		this.lastStepRTC = +new Date;
		this.fpsIndex = ++this.fpsIndex%100;
		this.fpsCounter[this.fpsIndex] = (this.lastStepRTC - now);
		return requestAnimationFrame(this.step);
}