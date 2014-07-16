UIFloating.prototype = new UIComponent();
UIFloating.prototype.constructor = UIFloating;

function UIFloating(content, classes) {

	this.mainDiv = undefined;
	this.classes = classes;
	this.content = content;

	this.timeOut = undefined;
	this.timedOut = false;

	this.parent = undefined;

	this.speed = 1;

	this.invalidated = true;

	this.center = true;

	// ---------------------------------------------------------------------------
	// main functions
	// ---------------------------------------------------------------------------
	this.init = function() {
		this.mainDiv = $('<div class="'+ this.classes +'"></div>');
		this.mainDiv.append(content);
		if(!this.parent) {
			$(document.body).append(this.mainDiv);
		} else {
			this.parent.append(this.mainDiv);
			this.mainDiv.offset(this.parent.offset());
		}
	};

	this.invalidate = function() {
		this.invalidated = true;
	};

	this.update = function(currentTime) {
		if(this.timedOut) {
			return;
		}

		if(this.timeOut && this.timeOut < currentTime) {
			this.timedOut = true;
		}
	};

	this.remove = function() {
		this.mainDiv.fadeOut(sys.floatFadeDelay, function() { $(this.mainDiv).remove(); });
	};
};
