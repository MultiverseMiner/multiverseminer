function UIComponent(id) {
    this.id = id;
    
    this.parent = undefined;
    this.classes = undefined;
    
    this.mainDiv = undefined;
    
    this.updateTime = 0;
    this.updateInterval = 0;
    
    this.updateCallback = undefined;

    this.isVisible = true;
    this.enabled = true;
    this.invalidated = true;
    this.updateWhenNeededOnly = true;

    // ---------------------------------------------------------------------------
    // main functions
    // ---------------------------------------------------------------------------
    this.init = function() {
    	// Check if the component holder exist, if not create it
    	this.mainDiv = $('#' + this.id);
    	if(this.mainDiv.length == 0) {
    		this.mainDiv = $('<div id="' + this.id + '"></div>');
    		if(this.classes) {
    			this.mainDiv.addClass(this.classes);
    		}
    		
    		// We are creating it so either append to body or a given parent
    		if(!this.parent) {
    			$(document.body).append(this.mainDiv);
    		} else {
    			this.parent.append(this.mainDiv);
    		}
    	}
    };
    
    this.hide = function() {
    	this.isVisible = false;
    	this.mainDiv.hide();
    };
    
    this.show = function() {
    	this.isVisible = true;
    	this.mainDiv.show();
    	this.invalidate();
    };
    
    this.update = function(currentTime) {
        if(!this.enabled || !this.isVisible) {
            return false;
        }

        // If we don't need an update and we are only allowed to update then bail out
        if(!this.invalidated && this.updateWhenNeededOnly) {
            return false;
        }

        // If we don't need an update and we are updating in intervals and our interval is not yet up, bail out
        if(!this.invalidated && this.updateInterval > 0 && currentTime - this.updateTime < this.updateInterval) {
            return false;
        }

        if(this.updateCallback) {
        	this.updateCallback();
        }

        this.updateTime = currentTime;
        this.invalidated = false;
        return true;
    };
    
    this.invalidate = function() {
    	this.invalidated = true;
    };
    
    this.getMainElement = function() {
		return this.mainDiv;
	};
};