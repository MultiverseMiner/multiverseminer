function Miner(id) {
	this.id = id;
	this.baseMineSpeed = 1;
	
	// ---------------------------------------------------------------------------
	// general
	// ---------------------------------------------------------------------------
	this.initialize = function() {
	};
	
	this.update = function(currentTime) {
	};

	this.gather = function(location) {
		var tableId = location.getGatherLootTableId();
		return this._dropResources(tableId);
	};

	this.mine = function(location, power, luck) {
		power = power || 1; //power comes from pickaxe
		luck = luck || 0;
		var tableId = location.getMiningLootTableId();
		items = this._dropResources(tableId, power, luck);
        return items;
	};

	this.scavenge = function(location) {
		var tableId = 1000;
		return this._dropResources(tableId);
	};
	
	// ---------------------------------------------------------------------------
	// internal
	// ---------------------------------------------------------------------------
	this._dropResources = function(tableId, power, luck) {
		power = power || 1; //never too safe ...
		luck = luck || 0;
		var table = game.getLootTable(tableId);
		if (!table || table.length <= 0) {
			return;
		}
		// Todo: apply modifiers and tools etc	
		items = game.loot(table, this.baseMineSpeed * power, luck);
		return items;
	};
	
	this._getStorageKey = function() {
		return 'miner_' + this.id + '_';
	};

	// ---------------------------------------------------------------------------
	// loading / saving
	// ---------------------------------------------------------------------------
	this.save = function() {
		var storageKey = this._getStorageKey();
		localStorage[storageKey + 'baseMineSpeed'] = this.baseMineSpeed;

	};

	this.load = function() {
		var storageKey = this._getStorageKey();
		this.baseMineSpeed = utils.loadFloat(storageKey + 'baseMineSpeed', 1);
	};

	this.reset = function(fullReset) {
		this.baseMineSpeed = 1;
	};
}
