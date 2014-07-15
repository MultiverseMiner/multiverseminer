require([ "jquery" ]);

UIStarfield.prototype = new UIComponent();
UIStarfield.prototype.$super = parent;
UIStarfield.prototype.constructor = UIStarfield;

StarTravelDisplayMode = {
		'fake3d': 1,
		'vertical2d': 2,
		'horizontal2d': 3
};

function UIStarfield() {
	this.id = 'starfield';
	
	this.starColor = utils.rgba(255, 255, 255);	
	this.backColor = utils.rgba();
	
	this.isAccelerating = true;
	this.isReverse = false;
	
	this.mode = StarTravelDisplayMode.fake3d;
	
	this.acceleration = 0.2;
	this.speedMax = 30;
	this.speedMin = 0;
	this.speed = this.speedMin;
	this.deceleration = 0.2;
	
	this.quantity = 512;
	this.ratio = 256;
	this.fps = 60;
	this.origin = undefined;
	this.size = undefined;
	this.stars = [];
	this.starColorRatio = 0;
	
	this.canvas = undefined;
	this.context = undefined;
	
	this.reachedMaxSpeed = undefined;
	this.reachedMinSpeed = undefined;
	
	this.lastUpdateTime = Date.now();
	
	// ---------------------------------------------------------------------------
    // overrides
    // ---------------------------------------------------------------------------
    this.baseInit = this.init;
    this.baseUpdate = this.update;
    this.baseShow = this.show;
    this.baseHide = this.hide;
    
	// ---------------------------------------------------------------------------
    // main functions
    // ---------------------------------------------------------------------------
	this.init = function() {
		this.baseInit();
		
		// Move the star travel screen to the back always
		this.mainDiv.prependTo(this.mainDiv.parent());

		// Create the canvas
		this.canvas = $('<canvas id="' + this.id + 'Canvas' + '"></canvas>');
		
		this.mainDiv.append(this.canvas);
		
		this._measure();
		this._generateStars();
		
		$(window).resize({ self: this }, this._onResize);
	};
	
	this.update = function(currentTime) {
		if(!this.baseUpdate(currentTime)) {
    		return false;
    	};
    	
    	this._calculateSpeed(currentTime);
    	
    	// limit to custom fps
    	if(currentTime - this.lastUpdateTime < 1000 / this.fps) {
    		return false;
    	}
    	
    	switch(this.mode) {
    		case StarTravelDisplayMode.fake3d: {
    			this._animateStarsFake3d();
    			break;
    		}
    		
    		default: {
    			this._animateStars2d();
    			break;
    		}
    	}
    	
    	this.lastUpdateTime = currentTime;
	};
	
	this.show = function() {
		this.baseShow();
		
    	this.canvas.show();
    	this._measure();
    	
    	this.invalidate();
    };
    
    this.hide = function() {
    	this.baseHide();
    	this.canvas.hide();
    };
	
	// ---------------------------------------------------------------------------
    // star travel functions
    // ---------------------------------------------------------------------------
	this.setStarColor = function(r, g, b, a) {
		this.starColor = utils.rgba(255, 255, 255);
		this.context.strokeStyle = this.starColor;
		this.invalidate();
	};
	
	this.setBackColor = function(r, g, b, a) {
		this.backColor = utils.rgba(r, g, b, a);
		this.context.fillStyle = this.backColor;
		this.invalidate();
	};
	
	this.decelerate = function() {
		this.speed = this.speedMax;
		this.isAccelerating = false;
	};
	
	this.accelerate = function() {
		this.speed = this.speedMin;
		this.isAccelerating = true;
	};
	
	// ---------------------------------------------------------------------------
    // internal functions
    // ---------------------------------------------------------------------------
	this._calculateSpeed = function() {
		if (this.isAccelerating) {
        	if(this.speed < this.speedMax) {
        		this.speed += this.acceleration;
        		if(this.speed > this.speedMax) {
        			this.speed = this.speedMax;
        			if(this.reachedMaxSpeed) {
        				this.reachedMaxSpeed(this);
        			}
        		}
        	}
    	} else {
    		if(this.speed > this.speedMin) {
    			this.speed -= this.deceleration;
    			if(this.speed < this.speedMin) {
    				this.speed = this.speedMin;
    				if(this.reachedMinSpeed) {
    					this.reachedMinSpeed(this);
    				}
    			}
    		}
    	}
	};
	
	this._measure = function() {
		this.canvas.width(this.mainDiv.width());		
		this.canvas.height(this.mainDiv.height());
		this.canvas[0].width = this.mainDiv.width();
		this.canvas[0].height = this.mainDiv.height();
		
		this.context = this.canvas[0].getContext('2d');
		this.context.fillStyle = this.backColor;
		this.context.strokeStyle = this.starColor;
		
		this.size = new Vector2(this.canvas.width(), this.canvas.height());
		
		this.origin = new Vector3();
		this.origin.x = Math.floor(this.size.x / 2);
		this.origin.y = Math.floor(this.size.y / 2);
		this.origin.z = (this.size.x + this.size.y) / 2;
		
		this.starColorRatio = 1 / this.origin.z;
	};
	
	this._onResize = function(parameters) {
		var self = parameters.data.self;
		
		if(!self.isVisible) {
			return;
		}
				
		self._measure();
		self._generateStars();
	};
	
	this._generateStars = function() {
		for(var i = 0; i < this.quantity; i++) {
			switch(this.mode) {
				case StarTravelDisplayMode.fake3d: {
					this.stars[i] = new Array(5); 

					this.stars[i][0] = Math.random() * this.size.x * 2 - this.origin.x * 2;
					this.stars[i][1] = Math.random() * this.size.y * 2 - this.origin.y * 2;
					this.stars[i][2] = Math.round(Math.random() * this.origin.z);
					this.stars[i][3] = 0;
					this.stars[i][4] = 0;
					
					break;
				}
				
				case StarTravelDisplayMode.horizontal2d:
				case StarTravelDisplayMode.vertical2d: {
					this.stars[i] = new Array(3); 
					
					this.stars[i][0] = Math.floor(Math.random() * this.size.x);
					this.stars[i][1] = Math.floor(Math.random() * this.size.y);
					this.stars[i][2] = Math.floor(Math.random() * this.speedMax);
					
					break;
				}
			}
		}
	};
	
	this._animateStars2d = function() {
		this.context.fillRect(0, 0, this.size.x, this.size.y);
		
		
		var save = new Vector2();
		for(var i = 0; i < this.stars.length; i++) {
			var speed = Math.min(this.speed, this.stars[i][2]);
			
			save.x = this.stars[i][0];
			save.y = this.stars[i][1];
			
			switch(this.mode) {
				case StarTravelDisplayMode.horizontal2d: {
					if(this.isReverse) {
						this.stars[i][0] = (this.stars[i][0] + speed + this.size.x) % this.size.x;
					} else {
						this.stars[i][0] = (this.stars[i][0] - speed + this.size.x) % this.size.x;						
					}
					
					break;
				}
				
				case StarTravelDisplayMode.vertical2d: {
					if(this.isReverse) {
						this.stars[i][1] = (this.stars[i][1] + speed + this.size.y) % this.size.y;
					} else {
						this.stars[i][1] = (this.stars[i][1] - speed + this.size.y) % this.size.y;	
					}
					
					break;
				}
			}
			
			if(Math.abs(this.stars[i][0] - save.x) >= this.size.x / 2) {
				continue;
			}
			
			if(Math.abs(this.stars[i][1] - save.y) >= this.size.y / 2) {
				continue;
			}
			
			if(save.x > 0
			&& save.x < this.size.x
			&& save.y > 0
			&& save.y < this.size.y) {
				this.context.lineWidth = 0.1 + (0.1 * speed);				
				this.context.beginPath();
				this.context.moveTo(save.x, save.y);
				this.context.lineTo(this.stars[i][0], this.stars[i][1]);
				this.context.stroke();
			}
		}
	};
	
	this._animateStarsFake3d = function() {
		this.context.fillRect(0, 0, this.size.x, this.size.y);

		var test = true;
		var save = new Vector2();
		
		for(var i = 0; i < this.stars.length; i++) {
			test = true;
			save.x = this.stars[i][3];
			save.y = this.stars[i][4];

			// X coords
			if(this.stars[i][0] > this.origin.x << 1) {
				this.stars[i][0] -= this.size.x << 1;
				test = false;
			}
			if(this.stars[i][0] <- this.origin.x << 1) {
				this.stars[i][0] += this.size.x << 1;
				test = false;
			}

			// Y coords
			if(this.stars[i][1] > this.origin.y << 1) {
				this.stars[i][1] -= this.size.y << 1;
				test = false;
			}
			if(this.stars[i][1] <- this.origin.y << 1) {
				this.stars[i][1] += this.size.y << 1;
				test = false;
			}

			// Z coords
			this.stars[i][2] -= this.speed;
			if(this.stars[i][2] > this.origin.z) {
				this.stars[i][2] -= this.origin.z;
				test = false;
			}
			if(this.stars[i][2] < 0) {
				this.stars[i][2] += this.origin.z;
				test = false;
			}

			this.stars[i][3] = this.origin.x + (this.stars[i][0] / this.stars[i][2]) * this.ratio;
			this.stars[i][4] = this.origin.y + (this.stars[i][1] / this.stars[i][2]) * this.ratio;

			if(save.x > 0
			&& save.x < this.size.x
			&& save.y > 0
			&& save.y < this.size.y
			&& test) {
				this.context.lineWidth = (1 - this.starColorRatio * this.stars[i][2]) * 2;
				this.context.beginPath();
				this.context.moveTo(save.x, save.y);
				this.context.lineTo(this.stars[i][3], this.stars[i][4]);
				this.context.stroke();
				this.context.closePath();
			}
		}
	};
};