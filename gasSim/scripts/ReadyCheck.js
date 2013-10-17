function Readycheck(){
	this.sets = {};
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
	 * Dynamically loads a script by inserting a &ltscript> tag to the head element of the parent page.
	 * @param url string
	 * @param callback function
	 * @private
	 */
	this.loadScript = function (url, callback) {
	    // Add the script tag to the head element
	    var head = document.getElementsByTagName('head')[0];
	    var script = document.createElement('script');
	    script.type = 'text/javascript';
	    script.src = url;

	    // Bind the event to the callback function.
	    script.onreadystatechange = function(e){
	    	if(e.readyState == Readycheck.DONE){
	    		callback.call(e);
	    	}
	    };
//	    script.onload = callback;

	    // Fire the loading
	    head.appendChild(script);
	};
	
};


Readycheck.prototype.add = function(urls, callback, setName){
	// Sanity check/fiddle
	if( ! callback instanceof Function ) return false;
	if( ! urls instanceof Array ) urls = [urls.toString()];
	setName = (setName instanceof String) ? setName : 'set'+this.setsIndex;

	this.sets[setName] = {
		'urls':urls,
		'callback':callback,
		'status':[]
	};
	this.setsIndex++;
	
	return setName;
};


Readycheck.prototype.loadScripts = function(urls, callback, setName){
	var sn = this.add(urls, setName, callback);
	setName = (setName && setName.length>0) ? setName : sn; 
	
	for(var i=0,s;s=urls[i];i++){
		var set = this.sets[setName];
		var status = set.status;
		var statusChange = function(e){
			status[i] = e.readyState;
			if( this.readyCheck(set) ) {
				set.callback.call(this);
			}
		};
		this.loadScript(s, statusChange);
	};
	
};


Readycheck.prototype.getSets = function(){
	return Object.keys(this.sets);
};

Readycheck.prototype.readyCheck = function(setName){
	var length = this.sets.setName.urls.length;
	for(var i=0,end=length;i<end;i++){
		var s=this.sets.setName.status[i];
		if( s !== Readycheck.DONE ){
			return false;
		} else return true;
	};
};