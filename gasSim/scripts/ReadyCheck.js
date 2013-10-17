function Readycheck(){
	this.sets = {};
	this.setsIndex = 0;
	
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
	function loadScript(url, callback)
	{
	    // Add the script tag to the head element
	    var head = document.getElementsByTagName('head')[0];
	    var script = document.createElement('script');
	    script.type = 'text/javascript';
	    script.src = url;

	    // Bind the event to the callback function.
	    script.onreadystatechange = function(e){
	    	if(e.readyState==4){
	    		// TODO P1 add to list of finished urls. when list completed, then call the sets callback
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

	this.sets.setName = {
		'urls':urls,
		'callback':callback
	};
	
	this.setsIndex++;
	return setName;
};


Readycheck.prototype.loadScript(urls, setName, callback){
	this.add(urls, setName, callback);
	
	this.loadScript();
};


Readycheck.prototype.getSets = function(){
	return Object.keys(this.sets);
}

