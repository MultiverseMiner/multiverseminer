require([ "uistarfield" ]);

UITravelScreen.prototype = new UIComponent();
UITravelScreen.prototype.$super = parent;
UITravelScreen.prototype.constructor = UITravelScreen;

function UITravelScreen() {
	this.id = 'travelScreen';
	
	this.parent = undefined;
	
	this.starfield = undefined;
	
	this.componentTravelDisplay = undefined;
	
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
    	
    	this.updateWhenNeededOnly = false;
    	
    	this.componentTravelDisplay = new UIComponent('travelDisplay');
        this.componentTravelDisplay.init();
        this.componentTravelDisplay.enabled = true;
        this.componentTravelDisplay.updateCallback = this.updateTravelDisplay;
        
        // Todo: refactor, just a test for now
        this.starfield = new UIStarfield();
        this.starfield.classes = 'panelTravelBackground';
        this.starfield.parent = $('#travelScreen');
        this.starfield.updateWhenNeededOnly = false;
        this.starfield.reachedMinSpeed = function(self) { self.hide(); };
        this.starfield.init();
        this.starfield.hide();
    };
    
    this.update = function(currentTime) {
    	if(!this.baseUpdate(currentTime)) {
    		return false;
    	};
    	
    	this.componentTravelDisplay.invalidate();
    	this.componentTravelDisplay.update(currentTime);
    	
    	this.starfield.update(currentTime);
    };
    
    this.show = function() {
    	this.baseShow();
    	
    	this.starfield.accelerate();
    	this.starfield.show();
    	this.invalidate();
    };
    
    this.hide = function() {
    	this.baseHide();
    	
    	// Don't need to hide it, decelerate will do
    	this.starfield.decelerate();
    };
    
    // ---------------------------------------------------------------------------
    // travel functions
    // ---------------------------------------------------------------------------
    this.updateTravelDisplay = function() {
    	var remaining = game.getRemainingTravelTime();
    	var remainingTime = Math.floor(remaining / game.player.getTravelSpeed()) * 1000;
    	$('#travelDistance').text(game.getRemainingTravelTime().formatNumber() + ' km - ETA: ' + utils.getShortTimeDisplay(remainingTime));
    };
};