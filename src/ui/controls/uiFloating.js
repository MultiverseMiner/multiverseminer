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

	// ---------------------------------------------------------------------------
	// float functions
	// ---------------------------------------------------------------------------
	this.offset = function(x, y) {
		var position = this.mainDiv.position();
		this.mainDiv.offset({ top: position.top + y, left: position.left + x});
	};

	this.moveTo = function(x, y) {
		if (this.center) {
			var p = this.parent[0];
			y += this.parent.height() / 2;
			x += this.parent.width() / 2;
		}
		var pStyle = this.mainDiv[0].style;
		pStyle.left = x + "px";
		pStyle.top = y + "px";
	};

	this.setContent = function(content) {
		this.mainDiv.html(content);
	};
};
