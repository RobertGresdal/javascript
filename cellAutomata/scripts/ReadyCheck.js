function Readycheck(){
	this.sets = [];
	this.setsIndex = 0;

	/** open() has not been called yet. */
	this.UNSENT = 0;
	/** send() has not been called yet. */
	this.OPENED = 1;
	/** send() has been called, and headers and status are available. */
	this.HEADERS_RECEIVED = 2;
	/** Downloading; responseText holds partial data. */
	this.LOADING = 3;
	/** The operation is complete. */
	this.DONE = 4;

	/**
	 * @constructor
	 */
	this.constructor = function(){

	};

	/**
	 * Dynamically loads a script by inserting a ```script``` tag to the head element of the parent page.
	 * @param url string
	 * @param callback function
	 * @private
	 */
	this.xhr = function (url, callback) {
	    var xhr = new XMLHttpRequest();
	    xhr.open('GET', url, true);

	    // Bind the event to the callback function.
	    xhr.onreadystatechange = callback;
	    xhr.send(null);
	};
};

(function(){
	Readycheck.prototype.appendScript = function(set, i){
		// Add the script tag to the head element
		var self = this;
	    var head = document.getElementsByTagName('head')[0];
	    var script = document.createElement('script');
	    script.type = 'text/javascript';

	    script.src = set.urls[i];
	    script.addEventListener('load',function(e){
	    	self.setStatus(set,i,true); // FIXME
	    },false);


	    head.appendChild(script);
	};

	Readycheck.prototype.loadScript = function(urls, callback, setName){
		var set = this.add(urls, callback, setName);
		setName = (setName && setName.length>0) ? setName : set.name;
		console.log(set);

		var end = set.urls.length;
		for(var i=0;i<end;i++){
			this.appendScript(set,i);
		}
	};

	Readycheck.prototype.setStatus = function(set, index, status){
		set.status[index] = status;

		if( this.readyCheck(set) ){
			set.callback.call(this);
    }
	};

	Readycheck.prototype.add = function(urls, callback, setName){
		// Sanity check/fiddle
		if( ! callback instanceof Function ) return false;
		if( ! urls instanceof Array ) urls = [urls.toString()];
		var friendlyName = (setName && setName.length>0) ? setName : 'set'+this.setsIndex;

		var set = {
			'id':this.setsIndex,
			'name':friendlyName,
			'urls':urls,
			'callback':callback,
			'status':[]
		};
		for(var i=0,end=set.urls.length;i<end;i++){
			set.status[i] = false;
		}

		this.sets[this.setsIndex] = set;
		this.setsIndex = this.sets.length;

		return set;
	};


	/*Readycheck.prototype.loadScripts = function(urls, callback, setName){
		var set = this.add(urls, setName, callback);
		setName = set.name;
		var self = this;

		for(var i=0,s;s=urls[i];i++){
			var statusChange = function(e){
				set.status[i] = e.readyState;
				if( self.readyCheck(set) ) {
					appendScript(set.urls);
					set.callback.call(this);
				}
			};
			this.xhr(s, statusChange);
		};

	};*/


	Readycheck.prototype.getSets = function(){
		return Object.keys(this.sets);
	};

	/**
	* Return true only if all statuses is true
	*/
	Readycheck.prototype.readyCheck = function(set){
		for( var i=0,end=set.status.length; i<end; i++ ){
			if( set.status[i] == false ){
				// quick escape as soon as a false value is found
				return false;
			}
		}
		console.log("Readycheck GO!");
		return true;
	};
})();
