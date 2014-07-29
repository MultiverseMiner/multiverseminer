require(["game", "gameminer", "gamestorage", "ui", "uiplanetscreen", "gamesettings", "simplemodal"]);

function Player() {
    this.id = 'player';
    this.miningLuck = 0;
    this.miner = new Miner('player');
    this.storage = new Storage('player');
    this.gear = new Gear('player');
    this.stats = null;
    this.oxygenConsumption = 1;
    this.canBreathe = true;
    this.lastOxygenConsumption = Date.now();
	this.strength = undefined;
    this.miningXPRequired = 500;
	this.gatheringXPRequired = 500;
	this.scavengingXPRequired = 500;
	this.miningXP = 0;
	this.miningLevel = 0;
	this.gatheringXP = 0;
	this.gatheringLevel = 0;
	this.scavengingXP = 0;
	this.scavengingLevel = 0;
	this.totalPower = 0;
	this.xpChanged = false;

    // ---------------------------------------------------------------------------
    // general
    // ---------------------------------------------------------------------------
    this.initialize = function() {
        this.miner.initialize();
        this.storage.initialize();
        this.gear.initialize();
		this.update();
        this.gear.addSlot('head');
        this.gear.addSlot('chest');
        this.gear.addSlot('mainHand');
        this.gear.addSlot('secondHand');
        this.gear.addSlot('legs');
        this.gear.addSlot('feet');
        this.gear.addSlot('miningGear');
        this.totalPower = this.calculatePower();
		this.updateUI();
		this.xpChanged = true;
    };
	
    this.calculatePower = function() {
        this.strength = this.gear.getStats()["strength"] || 0;
        this.miningLuck = this.gear.getStats()["miningLuck"] || 0;
        this.totalPower = this.strength * this.miningLuck;
		this.stats["totalPower"] = this.totalPower;
        return this.totalPower;
    };
	
	//this.calculateMaxHealth = function() {
	//	this.maxHealth = 5 + this.gear.getStats().health;
	//	return this.maxHealth;
	//};
	
	this.gainMiningXP = function(value) {
		this.miningXP += value;
		this.checkMiningLevel();
		this.xpChanged = true;
	};
    
	this.gainScavengingXP = function(value) {
    	this.scavengingXP += value;
		this.checkScavengingLevel();
		this.xpChanged = true;
    };
	
	this.gainGatheringXP = function(value) {
		this.gatheringXP += value;
		this.checkGatheringLevel();
		this.xpChanged = true;
	};
	
	this.checkMiningLevel = function() {
		this.miningXPRequired = Math.floor(Math.pow(2.125, this.miningLevel) * 500);
		if (this.miningXPRequired < 500) this.miningXPRequired = 500;
		if(this.miningXP >= this.miningXPRequired) {
			this.miningLevel ++;
			this.miningXPRequired = Math.floor(Math.pow(2.125, this.miningLevel) * 500);
			this.miningXP = 0;
			this.setStats();
			uiplanetscreen.clearCraftingPanel();
			uiplanetscreen.updateCraftingPanel();
			return true;
		};
		return false;
	};
	
	this.checkScavengingLevel = function() {
		this.scavengingXPRequired = Math.floor(Math.pow(2.125, this.scavengingLevel) * 500);
		if (this.scavengingXPRequired < 500) this.scavengingXPRequired = 500;
		if(this.scavengingXP >= this.scavengingXPRequired) {
			this.scavengingLevel ++;
			this.scavengingXPRequired = Math.floor(Math.pow(2.125, this.scavengingLevel) * 500);
			this.scavengingXP = 0;
			this.setStats();
			this.xpChanged = false;
			return true;
		};
		return false;
	};
	
	this.checkGatheringLevel = function() {
		this.gatheringXPRequired = Math.floor(Math.pow(2.125, this.gatheringLevel) * 500);
		if (this.gatheringXPRequired < 500) this.gatheringXPRequired = 500;
		if (this.gatheringXP >= this.gatheringXPRequired) {
			this.gatheringLevel ++;
			this.gatheringXPRequired = Math.floor(Math.pow(2.125, this.gatheringLevel) * 500);
			this.gatheringXP = 0;
			this.setStats();
			return true;
		}
		return false;
	};
	
	this.setStats = function() {
		$('#miningXP')[0].innerHTML = "Mining XP: " + Math.floor(this.miningXP) + " / " + Math.ceil(this.miningXPRequired);
		$('#miningLevel')[0].innerHTML = "Mining Level: " + this.miningLevel;
		$('#gatheringXP')[0].innerHTML = "Gathering XP: " + Math.floor(this.gatheringXP) + " / " + Math.ceil(this.gatheringXPRequired);
		$('#gatheringLevel')[0].innerHTML = "Gathering Level: " + this.gatheringLevel;
		$('#scavengingXP')[0].innerHTML = "Scavenging XP: " + Math.floor(this.scavengingXP) + " / " + Math.ceil(this.scavengingXPRequired);
		$('#scavengingLevel')[0].innerHTML = "Scavenging Level: " + this.scavengingLevel;
	};
	
	this.updateUI = function(){
		if (this.xpChanged) this.setStats();
		this.xpChanged = false;
	};
	
    this.update = function(currentTime) {
        this.miner.update(currentTime);
        this.stats = this.gear.getStats();
        this.totalPower = this.calculatePower();
		this.updateUI();
		this.checkGatheringLevel();
		this.checkMiningLevel();
		this.checkScavengingLevel();
        this.checkPlanet();
        if (!this.canBreathe) {
            if (currentTime - this.lastOxygenConsumption > 1000) {
                // TODO: need to do something when this runs out
                if (this.storage.getItemCount(Items.oxygen.id) > 0) {
                    this.storage.removeItem(Items.oxygen.id);
                }
                this.lastOxygenConsumption = currentTime;
            }
        }
    };
	
	//---------------------------------------------------------------------------
	//Player Storage Key
	//---------------------------------------------------------------------------
	
	this._getStorageKey = function() {
		return 'player_' + this.id + '_';
	};
	 
    // ---------------------------------------------------------------------------
    // player functions
    // ---------------------------------------------------------------------------	
    this.mine = function() {
        if (!game.currentPlanet) return false;
        
        var items = this.miner.mine(game.currentPlanet, this.pickPower, this.miningLuck);
		
        if (items) {
            this.storage.addItems(items);
			this.gainMiningXP(items.length);
			game.settings.addStat('foundItems', items.length);
			this.xpChanged = true;
			return true;
        };
        return false;
    };

    this.gather = function() {
        if ( !game.currentPlanet ) return false;
        var items = this.miner.gather(game.currentPlanet);
		if (items) {
            this.storage.addItems(items);
			this.gainGatheringXP(items.length);
			game.settings.addStat('foundItems', items.length);
			this.xpChanged = true;
            return true;
        };
        return false;
    };
    
    this.scavenge = function() {
        if ( !game.currentPlanet ) return false;
        var items = this.miner.scavenge(game.currentPlanet);
        if (items) {
			this.storage.addItems(items);
			this.gainScavengingXP(items.length);
			game.settings.addStat('foundItems', items.length);
			this.xpChanged = true;
            return true;
        };
        return false;
    };

    this.decompose = function(item) {
        itemId = item.id;
        item = game.getItem(itemId).craftCost;
        for (var key in item) {
            if (item.hasOwnProperty(key)) {
                this.storage.addItem(key, item[key]);
            }
        }
        this.storage.removeItem(itemId);
    };

    this.canDecomposeItem = function(item) {
        return (item.category === "scavenge" ? true : false);
    };

    this.decomposeScavenged = function() {
        // Decomposing scavenged items
        // TODO - Add stat for whatever items you found.
        if (!this.storage.getItemsOfCategory("scavenge")) {
            return ui.noty({
                	text: "You don't have anything to decompose.",
                	type: "information",
                	timeout: 1000
            });
        };
        var tmpItems = this.storage.getItemsOfCategory("scavenge");
        var scavengedItems = [];
        var gained = {};
        var removed = {};
        for (var i = 0; i < tmpItems.length; i++) {
            scavengedItems.push([game.getItem(tmpItems[i]), this.storage.items[tmpItems[i]]]);
        }
        if (!scavengedItems) {
            return;
        }

        for (var i = 0; i < scavengedItems.length; i++) {
            var item = scavengedItems[i][0];
            var count = scavengedItems[i][1]; //how many of each item being decomposed
            for (var key in item.craftCost) {
                this.storage.addItem(key, item.craftCost[key] * count);
                gained[key] = gained[key] ? gained[key] + item.craftCost[key] * count : item.craftCost[key] * count;
            }
            removed[item.id] = removed[item.id] ? removed[item.id] + count : count;
            this.storage.removeItem(item.id, count);
        }

        var gainedString = "<strong>Gained:</strong><br> ";
        for (var key in gained) {
            gainedString += game.getItem(key).name + " x " + gained[key] + ", ";
        }
        gainedString.substring(0, gainedString.length - 2);

        var removedString = "<br><br><strong>Lost:</strong><br>";
        for (var key in removed) {
            removedString += game.getItem(key).name + " x " + removed[key] + ", ";
        }
        removedString = removedString.substring(0, removedString.length - 2);
        gainedString = gainedString.substring(0, gainedString.length - 2);
		try {
			$(this).dialog("close");
		} catch (e) {}
        $('#decompModal').modal({
			onShow: function(dialog) { $(dialog.container).draggable({handle: 'div'}); },
            opacity: 40,
            escClose: true,
            overlayClose: true,
            overlayCss: {
                backgroundColor: "#000"
            },
            containerId: 'decompBox'
        });
        $("#decompModal").append(gainedString + "" + removedString + "");
        delete scavengedItems;
    };

    this.craft = function(itemId, count) {
        // For now we craft with our inventory into our inventory
        try {
            if (game.craft(this.storage, this.storage, itemId, count));
            return true;
        } catch (err) {
            console.log(e);
            return false;
        };
        return true;
    };

    this.checkPlanet = function() {
        if (game.currentPlanet != null) {
            if (game.currentPlanet.data.oxygen == true) {
                this.canBreathe = true;
            } else {
                this.canBreathe = false;
            }
        }
    };

    this.equip = function(itemId) {
        this.gear.equip(itemId, this.storage.getItemMetadata(itemId));
        this.storage.removeItem(itemId);
		game.player.updateUI();
    };

    this.canEquip = function(itemId) {
        return this.gear.canEquip(itemId);
    };

    this.unEquip = function(type) {
        if (!this.hasEquipped(type)) {
            return;
        }
        var itemId = this.gear.getItemInSlot(type);
        this.gear.unEquip(type);
        game.player.storage.addItem(itemId);
        game.player.gear.gearChanged = true;
		game.player.updateUI();
    };

    this.hasEquipped = function(type) {
        return this.gear.getItemInSlot(type) !== undefined;
    };

    this.getTravelSpeed = function() {
        // TODO: hardcoded for now until ship is done
        return 5000;
    };
	
    // ---------------------------------------------------------------------------
    // loading / saving
    // ---------------------------------------------------------------------------
    this.save = function() {
		var storageKey = this._getStorageKey();
        this.miner.save();
        this.storage.save();
        this.gear.save();
		localStorage[storageKey + 'miningXP'] = this.miningXP;
		localStorage[storageKey + 'miningLevel'] = this.miningLevel;
		localStorage[storageKey + 'miningXPRequired'] = this.miningXPRequired;
		localStorage[storageKey + 'gatheringXP'] = this.gatheringXP;
		localStorage[storageKey + 'gatheringLevel'] = this.gatheringLevel;
		localStorage[storageKey + 'gatheringXPRequired'] = this.gatheringXPRequired;
		localStorage[storageKey + 'scavengingXP'] = this.scavengingXP;
		localStorage[storageKey + 'scavengingLevel'] = this.scavengingLevel;
		localStorage[storageKey + 'scavengingXPRequired'] = this.scavengingXPRequired;
        localStorage.playerOxygenConsumption = this.oxygenConsumption;
        localStorage.planetID = game.currentPlanet.data.id;

    };

    this.load = function() {
		var storageKey = this._getStorageKey();
        this.miner.load();
        this.storage.load();
        this.gear.load();
        this.stats = this.gear.getStats();
        this.oxygenConsumption = utils.loadFloat('playerOxygenConsumption', 1);
        this.totalPower = this.calculatePower();
		this.miningXPRequired = utils.loadFloat(storageKey + 'miningXPRequired', 500);
		this.gatheringXPRequired = utils.loadFloat(storageKey + 'gatheringXPRequired', 500);
		this.scavengingXPRequired = utils.loadFloat(storageKey + 'scavengingXPRequired', 500);
		this.miningLevel = utils.loadFloat(storageKey + 'miningLevel', 0);
		this.miningXP = utils.loadFloat(storageKey + 'miningXP', 0);
		this.gatheringLevel = utils.loadFloat(storageKey + 'gatheringLevel', 0);
		this.gatheringXP = utils.loadFloat(storageKey + 'gatheringXP', 0);
		this.scavengingLevel = utils.loadFloat(storageKey + 'scavengingLevel', 0);
		this.scavengingXP = utils.loadFloat(storageKey + 'scavengingXP', 0);
        game.currentPlanet = game.planets[utils.loadInt('planetID', 1)];
        game.planetChanged = true;
    };

    this.reset = function(fullReset) {
        game.wasReset = true;
        $(window).off('onbeforeunload');
        this.storage.reset(fullReset);
        this.gear.reset(fullReset);
        this.miner.reset(fullReset);
        this.oxygenConsumption = 1;
        this.strength = 0;
        this.miningLuck = 0;
        this.baseMineSpeed = 1;
		this.miningXP = 0;
		this.miningLevel = 0;
        this.miningXPRequired = 500;
		this.gatheringXP = 0;
		this.gatheringLevel = 0;
		this.gatheringXPRequired = 500;
		this.scavengingXP = 0;
		this.scavengingLevel = 0;
		this.scavengingXPRequired = 500;
        game.wasReset = false;
        $(window).on('onbeforeunload');
		this.xpChanged = true;
    };
};