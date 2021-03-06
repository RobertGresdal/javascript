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
	root:{dots:[],lastdots:[],dotslength:0},
	kdtree:null,
	quadTree:null,
	state:{running:0},
	gamemode:{
		current:(1+4+16+64+128),
		EXPLOSIVE:1,
		GRAVITY:2,
		FRICTION:4,
		MERGE:8,
		ALLDOTS:16,
		SELFGRAVITY:32,
		SELFEXPLOSIVE:64,
		QUADTREE:128
	},
	settings:{DRAWNODES:false,PARTICLES:500},
	energy:0,
	
	init : function(){
		var self = this;
		var canvas = document.getElementById('game');
		//game.fpsCounter = new Array(100);
		
		// WINDOW SIZE AND RESIZE
		game.width = document.body.clientWidth - 40;
		game.height = document.body.clientHeight - 80;
		window.addEventListener('resize',function(e){
			game.width = document.body.clientWidth - 40;
			game.height = document.body.clientHeight - 80;
			canvas.width = game.width;
			canvas.height = game.height;
			
			var bounds = {x:0,y:0,width:game.width,height:game.height};
			var pointQuad = true;
			var maxDepth = 16;
			var maxChildren = 4;
			game.quadTree = new QuadTree(bounds, pointQuad, maxDepth, maxChildren);
		},false);
		
		canvas.width = game.width;
		canvas.height = game.height;
		this.context = canvas.getContext('2d');
		
		canvas.addEventListener('mousemove',function(e){
			//game.mouse = {x:e.clientX, y:e.clientY};
			game.mouse = {x: e.pageX-this.offsetLeft, y:e.pageY-this.offsetTop};
		},false);
		canvas.addEventListener('mouseout',function(){game.mouse=null;},false);
		
		//this.root.dots = [new Dot(10,40),new Dot(80,150),new Dot(350,440)];
		var size = this.settings.PARTICLES;
		this.root.dots = new Array(size);
		for(var i=0;i<size;i++){
			this.root.dots[i] = new Dot(
				Math.random()*game.width, Math.random()*game.height,
				/*Math.random()/10-0.05,Math.random()/10-0.05,*/
				0,0,
				0,0
			);
		};
		this.root.dotslength = this.root.dots.length;
		//console.debug(this.root.dots[0],this.root.dots[size-1]);
		
		//this.kdTree = new kdTree(this.root.dots, game.distance, ['x','y']);
		var bounds = {x:0,y:0,width:game.width,height:game.height};
		var pointQuad = true;
		var maxDepth = 16;
		var maxChildren = 4;
		this.quadTree = new QuadTree(bounds, pointQuad, maxDepth, maxChildren);
		this.quadTree.insert(this.root.dots);
		
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
		};
		document.body.onmouseup = function(evt) {
		  --self.mouseButton[evt.button];
		};
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
		this.energy=0;
		
		// Update the k-d Tree
		/*timer.each(100,function(){
			this.kdTree = new kdTree(this.root.dots, game.distance, ['x','y']);
		},this);*/
		
		this.quadTree.clear();
		this.quadTree.insert(this.root.dots);
		
		// IF MOUSE BUTTON PRESSED, CREATE PARTICLES
		timer.each(50,function(){
			if( this.mouse && this.mouseButton[0]>0 ){
				var dot = new Dot(this.mouse.x, this.mouse.y, Math.random()-0.5,Math.random()-0.5, 0,0);
				//console.log(dot);
				this.root.dots.push(dot);
				this.root.dotslength = this.root.dots.length;
			};
		},self);
		
		
		
		// FIXME add using quadtree
		/*var nearest = self.mouse==null ? [] : 
			self.kdTree.nearest({'x':self.mouse.x,'y':self.mouse.y}, Math.min(self.root.dotslength-5,100));*/
		var nearest = self.mouse==null ? [] :
			self.quadTree.retrieve({x:self.mouse.x,y:self.mouse.y,height:100,width:100});
		var diff = self.root.lastdots.diff(nearest);

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
		
		
		
		
		for(var i=0,d=null;d=this.root.dots[i];i++){
			// DOT GRAVITY
			var colliders = [];
			if(this.gamemode.current & this.gamemode.ALLDOTS) {
				// DETERMINE OPTIMISED SEARCH ALGORITHM
				var neardot;
				var sortMethod;
				if( this.gamemode.current & this.gamemode.KDTREE ){
					neardot = self.kdTree.nearest({'x':d.x,'y':d.y}, 2);
					sortMethod=this.gamemode.KDTREE;
				} else if ( this.gamemode.current & this.gamemode.QUADTREE ) {
					neardot = self.quadTree.retrieve({x:d.x, y:d.y, height:10, width:10});
					sortMethod=this.gamemode.QUADTREE;
				}
				//timer.each(100,function(){console.log(neardot.length)},this);
				
				
				for(var k=0,m=null;m=neardot[k];k++){
					var nd = (sortMethod==this.gamemode.KDTREE) ? m[0] : m;
					if( nd==d ) continue;
					
					var distance = nd.distance(nd,d);
					
					// MERGING
					if(distance < 1 && this.gamemode.current & this.gamemode.MERGE){
						var ix = this.root.dots.indexOf(nd);
						this.root.dots.splice(ix,1); // nd is never d, so parent loop should not fail
						this.root.dotslength = this.root.dots.length;
						d.size += nd.size;
					} else if(distance < 200){
						//console.log('COLLISION',d,nd);
						
						if(this.gamemode.current & this.gamemode.SELFEXPLOSIVE) {
							var MODIFIER = 10000;
							nd.ax = (nd.x-d.x)/MODIFIER;
							nd.ay = (nd.y-d.y)/MODIFIER;
							nd.color='red';
							d.color = 'purple';
							d.ax = -nd.ax;
							d.ay = -nd.ay;
						} else if(this.gamemode.current & this.gamemode.SELFGRAVITY){
							var MODIFIER = 10000;
							nd.ax = (d.x-nd.x)/MODIFIER;
							nd.ay = (d.y-nd.y)/MODIFIER;
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
		
		// FPS Graph
		(function(){
			c.strokeStyle = '#333';
			var graphLeft = game.width-205;
			var graphTop = 5;
			var graphBottom = 10;
			var graphHeight = 50;
			var graphWidth = 200;
			
			//c.strokeStyle = 'white';
			c.lineWidth = 1;
			c.fillStyle = 'black';
			//c.fillRect(graphLeft,graphTop, graphWidth, graphHeight);
			
			for(var i=0,e=game.fpsCounter.length;i<e;i++){
				c.moveTo(graphLeft+i*2+0.5,graphBottom);
				c.lineTo(graphLeft+i*2+0.5,graphBottom + game.fpsCounter[i]);
				c.stroke();
			}
		})();
		
//		timer.each(1000,function(){console.log(this.quadTree.root)},this);
		function drawNode(node){
			for(var i=0;i<4;i++){
				var cn = node.nodes[i];
				if(cn)drawNode(cn)
				else {
					var bounds = node._bounds;
					c.beginPath();
					c.rect(bounds.x,bounds.y,bounds.width,bounds.height);
					c.fill();
				}
			}
		}
		if(this.settings.DRAWNODES){
			c.strokeStyle = '#f8f8f8';
			c.lineWidth = 1;
			drawNode(this.quadTree.root);
		}
		// FPS counter (text)
		var fps = game.fpsCounter.reduce(function(a, b) { return a ? (a + b) : b }) / game.fpsCounter.length;
		c.fillText((1000/fps).toLocaleString(), 10, 20);
			
		c.fillText(this.runtime, 10, 40);
		c.fillText('Particles: '+this.root.dotslength, 10, 60);
		
		//c.fillText('energy: '+this.energy.toLocaleString(), 10, 80);
		if(this.mouse)c.fillText(this.mouse.x +", "+this.mouse.y, 10,80);
		
		//c.fillText(this.kdTree.balanceFactor(),10,80);
		for(var i=0,d;d=this.root.dots[i];i++){
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
		game.fpsIndex = ++game.fpsIndex%100;
		game.fpsCounter[game.fpsIndex] = (game.lastStepRTC - now);
		return requestAnimationFrame(game.step);
	},
	distance : function(a,b){
		return Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2);
	}
};