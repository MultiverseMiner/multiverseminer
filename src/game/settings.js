function Settings() {
	this.totalStats = new Statistics('total');
	this.sessionStats = new Statistics('session');

	this.autoSaveEnabled = true;
	this.autoSaveInterval = 60 * 1000;
	
	this.savedVersion = 0;

	this.currentPlanet;

	this.targetPlanet;
	this.travelActive;
	this.travelDistanceRemaining;
	this.travelDistanceElapsed;
	this.showTutorial;
	
	// UI settings
	this.selectedPlayerInventoryFilter = 1;
	this.selectedPlanetInventoryFilter = 1;
	
	this.isNewGame = true;
	this.showTutorial = true;
	
	this.showPopups = true;
	
	// ---------------------------------------------------------------------------
	// general
	// ---------------------------------------------------------------------------
	this.initialize = function() {
		this.totalStats.initialize();
		this.sessionStats.initialize();
	};
	
	this.togglePopups = function() {
		this.showPopups = !this.showPopups;
	};

	// ---------------------------------------------------------------------------
	// stats
	// ---------------------------------------------------------------------------
	this.addStat = function(key, value) {
		if (!value) {
			this.totalStats[key]++;
			this.sessionStats[key]++;
			return;
		}

		this.totalStats[key] += value;
		this.sessionStats[key] += value;
	};

	// ---------------------------------------------------------------------------
	// loading / saving / reset
	// ---------------------------------------------------------------------------
	this.save = function() {
		this.totalStats.save();
		this.sessionStats.save();

		localStorage.currentPlanet = this.currentPlanet;

		localStorage.autoSaveEnabled = this.autoSaveEnabled;
		localStorage.autoSaveInterval = this.autoSaveInterval;
		
		localStorage.savedVersion = this.savedVersion;

		localStorage.targetPlanet = this.targetPlanet;
		localStorage.travelActive = this.travelActive;
		localStorage.travelDistanceRemaining = this.travelDistanceRemaining;
		localStorage.travelDistanceElapsed = this.travelDistanceElapsed;
		
		localStorage.selectedPlayerInventoryFilter = this.selectedPlayerInventoryFilter;
		localStorage.selectedPlanetInventoryFilter = this.selectedPlanetInventoryFilter;
		
		localStorage.isNewGame = this.newGame;
		localStorage.showTutorial = this.showTutorial;

		localStorage.showPopups = this.showPopups;
	};

	this.load = function() {
		this.totalStats.load();
		this.sessionStats.load();

		this.currentPlanet = utils.loadInt("currentPlanet", 0);

		this.autoSaveEnabled = utils.loadBool("autoSaveEnabled", true);
		this.autoSaveInterval = utils.loadInt("autoSaveInterval", 60 * 1000);
		
		this.savedVersion = utils.loadFloat("savedVersion", 0);

		this.targetPlanet = utils.load("targetPlanet", undefined);
		this.travelActive = utils.loadBool("travelActive", 0);
		this.travelDistanceRemaining = utils.loadFloat("travelDistanceRemaining", 0);
		this.travelDistanceElapsed = utils.loadFloat("travelDistanceElapsed", 0);
		
		this.selectedPlayerInventoryFilter = utils.loadInt('selectedPlayerInventoryFilter', 1);
		this.selectedPlanetInventoryFilter = utils.loadInt('selectedPlanetInventoryFilter', 1);
		
		this.isNewGame = utils.loadBool("isNewGame", true);
		this.showTutorial = utils.loadBool("showTutorial", true);

		this.showPopups = utils.loadBool("showPopups", true);
	};

	this.reset = function(fullReset) {
		this.sessionStats = new Statistics('session');
		this.sessionStats.initialize();

		this.currentPlanet = 0;

		this.targetPlanet = undefined;
		this.travelActive = false;
		this.travelDistanceRemaining = 0;
		this.travelDistanceElapsed = 0;
		
		this.isNewGame = true;
		this.showTutorial = true;
		
		this.showPopups = true;

		this.totalStats = new Statistics('total');
		this.totalStats.initialize();
	};
}
