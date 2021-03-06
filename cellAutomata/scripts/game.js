"use strict";

function Game() {
	//this.w_topology = new Worker("worker.js");
	//this.workerVField = new Worker("workerVField.js");
	this.context = null;
	this.width = document.body.clientWidth - 400;
	this.height = document.body.clientHeight - 10;
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
	this._renderCalls = 0;
	this._renderCallsPerSecond = 0;
	this._renderCallCount = 0;
	this._renderLastTime = +new Date;
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
	this.mouse = {};
	this.mouseButton = null;
	/*this.root = {
		cells: [],
		cellsLastTick: [],
		numCells: 0
	};*/
	this.state = { running:0 };
	/*this.gameflags = {
		DUMMY: 1,
	};*/
	this.settings = { numOfCells:500, showFPSGraph:false, showNodes:false };
	//this.topo = new Topology(0, 0, this.width, this.height);
	this.topo = new TopologyMaster(0, 0, this.width, this.height);
	this.topo.options.showNodes = this.settings.showNodes;

	this.init();
}

Game.prototype.init = function() {
		var game = this,
			canvas = document.querySelector("#canvas");
		//this.fpsCounter = new Array(100);

		// WINDOW SIZE AND RESIZE
		canvas.width = this.width;
		canvas.height = this.height;
		this.context = canvas.getContext("2d");
		this.context.translate(0.5,0.5);
		this.context.strokeStyle = "white";
		this.context.fillStyle = "black";

		window.addEventListener("resize", function(e) {
			this.width = document.body.clientWidth - 400;
			this.height = document.body.clientHeight - 10;
			canvas.width = this.width;
			canvas.height = this.height;
			game.topo.update();
		}, false);

		// Capture mouse movement
		canvas.addEventListener("mousemove", function(e) {
			game.mouse = { x:e.pageX - canvas.offsetLeft, y:e.pageY - canvas.offsetTop };
		}, false);
		canvas.addEventListener("mouseout", function() { game.mouse = null; }, false);

		/**
		* Initialize cells
		*/
		/*this.root.cells = new Array(this.settings.numOfCells);
		for (var i = 0; i < this.settings.numOfCells; i++ ) {
			this.root.cells[i] = new Cell();
		};
		this.root.numCells = this.root.cells.length;*/

		// Track state of mousbuttons as a read-on-demand variable
		game.mouseButton = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
		document.body.onmousedown = function(evt) {
			console.log("Mouse button down ", evt.button);
		  game.mouseButton[evt.button]++;
		};
		document.body.onmouseup = function(evt) {
		  game.mouseButton[evt.button]--;
		};
};

	/**
	* Calls game logic and simulation
	* @function
	* @private
	*/
Game.prototype.tick = function(t) {
		//timer.calleach(1000,function(){console.log(Math.random(5))});
		var self = this;

		if (this.mouseButton[0] && self.mouse){
			var p = new Particle(self.mouse.x,self.mouse.y);//,
				p.width = this.topo.zoom;
				p.height = this.topo.zoom;
				//p_i = p.inverse();
				// FIXME: actually p_i should have -E. Could add for some interesting
				// effects if I actually annihalate them and let inaccuracies account
				// for the descrepancy of whichever is left over, but that would
				// be a project for another time.
			this.topo.add( p );
			//this.topo.add( p_i );
		}

		this.topo.tick(t);

		//this.topo.prune();
		//this.mouse.particle = this.topo.closestToMouse(game.mouse);
};

	/**
	* Performs the drawing to screen
	* @function
	* @private
	*/
Game.prototype.render = function() {
		var c = this.context;
		//c.fillStyle = "rgba(0,0,0, .05)";
		c.fillStyle = "rgba(10,10,10,1)";
		c.fillRect(0, 0, this.width, this.height);
		c.fillStyle = "rgba(0,0,0,1)";
		c.fillRect(0, 0, 150, 80);

		this.topo.render(c);
		//if(this.mouse)c.strokeRect(this.mouse.x-10, this.mouse.y, 20, 20);

		c.fillStyle = "black";
		c.font = "9pt DejaVu Sans";

		// FPS counter (text)
		c.fillStyle = "white";
		//var fps = this.fpsCounter.reduce(function(a, b) { return a ? (a + b) : b }) / this.fpsCounter.length;
		var fps = this.fpsCounter.average();
		c.fillText((1000/fps).toLocaleString(), 10, 20);
		//c.fillText((this._renderCallsPerSecond).toLocaleString(), 10, 20);

		c.fillText(this.runtime, 10, 40);
		c.fillText('Particles: ' + this.topo.size, 10, 60);

		//c.fillText('energy: '+this.energy.toLocaleString(), 10, 80);
		if(this.mouse)c.fillText("["+this.mouse.x +", "+this.mouse.y+"]", 10,80);

		c.fillText("Fills: "+this.topo.vfield.fills, 10,100);
		c.fillText("Field size: "+this.topo.vfield.node.field.mass.length, 10,120);

		/*if(this.mouse && this.mouse.particle && this.mouse.particle[0]){
			var p = this.mouse.particle[0];
			c.fillText("{ x:" + p.x +  ",  y:" + p.y, 10,100);
			c.fillText(" vx:" + p.vx + ", vy:" + p.vy, 10,120);
			c.fillText(" ax:" + p.vx + ", ay:" + p.ay, 10,140);
			c.fillText(" mass:" + p.mass + " }", 10,160);
		}*/

		//c.fillText(this.kdTree.balanceFactor(),10,80);
		/*for (var i = 0, d; d = this.root.cells[i]; i++) {
			// Fetch color settings and size of circle
			c.fillStyle = d.color;
			//var size = Math.sqrt(d.size);
			var size = 1 + Math.log(d.size);

			c.fillRect(d.x-size/2, d.y-size/2, size, size);
		}*/
};

Game.prototype.step = function(timestamp) {
	var now = +new Date;
	var diff = (now - this.lastStepRTC);

	this.runtime += diff;

	if( this.topo.updated ){
		//this._renderCallsPerSecond = (1000/(now - this._renderLastTime));
		//this._renderLastTime = +new Date;
		this.render();
	}

	this.steps = 0;
	while ( this.timer < (this.runtime - this.stepAccuracy) ) {
		this.tick(this.stepAccuracy);
		this.timer += this.stepAccuracy;
		this.steps++;
	}

	this.lastStepRTC = +new Date;
	this.fpsIndex = ++this.fpsIndex % 100;
	this.fpsCounter[this.fpsIndex] = (this.lastStepRTC - now);
	return this.requestAnimationFrame(this.step);
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

Game.prototype.start = function() {
		console.log('Starting simulation');

		this.animStart = +new Date;
		this.lastStepRTC = this.animStart;
		this.state.running = 1;
		//var self = this;
		//this.animFrame = requestAnimationFrame( function(){ self.step() } );
		this.requestAnimationFrame();
		//console.log(this.animStart);
}
Game.prototype.pause = function() {
		this.state.running = 0;
		cancelAnimationFrame(this.animFrame);
}
Game.prototype.resume = function() {
		this.state.running = 1;
		this.animFrame = this.requestAnimationFrame(this.step);
}
Game.prototype.requestAnimationFrame = function(t) {
	var self = this;
	this.animFrame = requestAnimationFrame( function(){ self.step(t) } );
	return this.animFrame;
}
