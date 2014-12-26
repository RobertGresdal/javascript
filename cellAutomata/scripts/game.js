'use strict';

var timer=null;

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
	/** Counts the ms between the last 5 frames */
	fpsCounter:[0,0,0,0,0],
	fpsIndex:-1,
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
	root:{cells:[],cellsLastTick:[],numCells:0},
	state:{running:0},
	gameflags:{
		DUMMY:1,
	},
	settings:{numOfCells:500,showFPSGraph:true},

	init : function(){
		var self = this;
		var canvas = document.querySelector('#game');
		//game.fpsCounter = new Array(100);

		// WINDOW SIZE AND RESIZE
		game.width = document.body.clientWidth - 400;
		game.height = document.body.clientHeight - 80;
		window.addEventListener('resize',function(e){
			game.width = document.body.clientWidth - 400;
			game.height = document.body.clientHeight - 80;
			canvas.width = game.width;
			canvas.height = game.height;

			var bounds = {x:0,y:0,width:game.width,height:game.height};
			var pointQuad = true;
			var maxDepth = 16;
			var maxChildren = 4;
			game.quadTree = new QuadTree(bounds, pointQuad, maxDepth, maxChildren);
		},false);
		//.
		canvas.width = game.width;
		canvas.height = game.height;
		this.context = canvas.getContext('2d');

		canvas.addEventListener('mousemove',function(e){
			game.mouse = {x: e.pageX-this.offsetLeft, y:e.pageY-this.offsetTop};
		},false);
		canvas.addEventListener('mouseout',function(){game.mouse=null;},false);

		/**
		* Initialize cells
		*/
		this.root.cells = new Array(this.settings.numOfCells);
		for(var i=0;i<this.settings.numOfCells;i++){
			this.root.cells[i] = new Cell();
		};
		this.root.numCells = this.root.cells.length;


		// QUADTREE
		/*
		//this.kdTree = new kdTree(this.root.dots, game.distance, ['x','y']);
		var bounds = {x:0,y:0,width:game.width,height:game.height};
		var pointQuad = true;
		var maxDepth = 16;
		var maxChildren = 4;
		this.quadTree = new QuadTree(bounds, pointQuad, maxDepth, maxChildren);
		this.quadTree.insert(this.root.dots);
		*/

		// Track state of mousbuttons as a read-on-demand variable
		self.mouseButton=[0, 0, 0, 0, 0, 0, 0, 0, 0];
		document.body.onmousedown = function(evt) {
		  ++self.mouseButton[evt.button];
		};
		document.body.onmouseup = function(evt) {
		  --self.mouseButton[evt.button];
		};
	},








	/**
	* Calls game logic and simulation
	* @function
	* @private
	*/
	tick : function(t) {
		//timer.calleach(1000,function(){console.log(Math.random(5))});
		var self=this;
		this.energy=0;

		// Update the k-d Tree
		/* timer.each(100,function(){
			this.kdTree = new kdTree(this.root.dots, game.distance, ['x','y']);
		},this);	*/

		// Update the QuadTree
		/*	this.quadTree.clear();
		this.quadTree.insert(this.root.dots);		*/


		// FIXME add using quadtree
		/*var nearest = self.mouse==null ? [] :
			self.quadTree.retrieve({x:self.mouse.x,y:self.mouse.y,height:100,width:100});
		var diff = self.root.lastdots.diff(nearest);*/
/*
		// restore old dots
		for(var i=0,j=diff.length;i<j;i++){
			//var dot = diff[i][0]; // KDTree has encapsulated the object within a secondary array
			var dot = diff[i];
			dot.color = 'black';
			dot.ax = 0;
			dot.ay = 0;
		}

		// color new dots
		for(var i=0,j=nearest.length;i<j;i++){
			//var dot = nearest[i][0]; // ONLY USING KDTree
			var dot = nearest[i];
			dot.color = 'green';
			var mousedist = dot.distance(dot,self.mouse);

			// Move away
			if(this.gamemode.current & this.gamemode.GRAVITY){
				var GRAVITY_MODIFIER = 0.05;
				if( mousedist < 100*100 ){
					dot.ax = (self.mouse.x-dot.x)/self.width*GRAVITY_MODIFIER;
					dot.ay = (self.mouse.y-dot.y)/self.height*GRAVITY_MODIFIER;
				}
			}
			else if(this.gamemode.current & this.gamemode.EXPLOSIVE) {
				if( mousedist < 100*100 ){
					var MODIFIER = 0.01;
					//dot.ax = (dot.x-self.mouse.x)/self.width;
					//dot.ay = (dot.y-self.mouse.y)/self.height;
					var dx = dot.x-self.mouse.x;
					var dy = dot.y-self.mouse.y;
					dot.ax = (1/Math.min(mousedist,1))*MODIFIER*Math.sign(dx);
					dot.ay = (1/Math.min(mousedist,1))*MODIFIER*Math.sign(dy);
				}
			}
		}
		self.root.lastdots = nearest.splice(0);
		// FIXME  END  add using quadtree
*/

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

		c.fillStyle = 'black';
		c.font = '9pt DejaVu Sans';

		// FPS Graph
		if( game.settings.showFPSGraph ){
			c.strokeStyle = '#333';
			var graphLeft = game.width-205;
			var graphTop = 5;
			var graphBottom = 10;
			var graphHeight = 50;
			var graphWidth = 200;

			c.lineWidth = 1;
			c.fillStyle = 'black';

			for(var i=0,e=game.fpsCounter.length;i<e;i++){
				c.moveTo(graphLeft+i*2+0.5,graphBottom);
				c.lineTo(graphLeft+i*2+0.5,graphBottom + game.fpsCounter[i]);
				c.stroke();
			}
		};

		// FPS counter (text)
		var fps = game.fpsCounter.reduce(function(a, b) { return a ? (a + b) : b }) / game.fpsCounter.length;
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
	},










	toggleRun : function(){
		if( game.state.running == 1){
			game.pause();
		} else {
			if( ! game.animStart ){
				game.start();
			} else {
				game.resume();
			}
		}
	},
	start : function(){
		console.log('Starting simulation');
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
		game.fpsIndex = ++game.fpsIndex%100;
		game.fpsCounter[game.fpsIndex] = (game.lastStepRTC - now);
		return requestAnimationFrame(game.step);
	}
};
