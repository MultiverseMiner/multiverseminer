function Statistics(key) {
    this.id = key;
    this.manualDigCount = "0";
    this.manualGatherCount = "0";
    this.manualScavengeCount = "0";
    this.autoDigCount = "0";
    this.autoScavengeCount = "0";
    this.autoGatherCount = "0";
    this.autoRefineCount = "0";
    this.foundItems = "0";
    this.autoProduceCount = "0";
    this.craftedItems = "0";

    // ---------------------------------------------------------------------------
    // general
    // ---------------------------------------------------------------------------
    this.initialize = function() {};

    // ---------------------------------------------------------------------------
    // internal
    // ---------------------------------------------------------------------------
    this._getStorageKey = function() {
        return 'stat_' + this.id + '_';
    };

    // ---------------------------------------------------------------------------
    // loading / saving / reset
    // ---------------------------------------------------------------------------
    this.save = function() {
        var storageKey = this._getStorageKey();
        localStorage[storageKey + 'manualDigCount'] = this.manualDigCount;
        localStorage[storageKey + 'manualGatherCount'] = this.manualGatherCount;
        localStorage[storageKey + 'manualScavengeCount'] = this.manualScavengeCount;
        localStorage[storageKey + 'autoDigCount'] = this.autoDigCount;
        localStorage[storageKey + 'autoGatherCount'] = this.autoGatherCount;
        localStorage[storageKey + 'autoScavengeCount'] = this.autoScavengeCount;
        localStorage[storageKey + 'autoRefineCount'] = this.autoRefineCount;
        localStorage[storageKey + 'foundItems'] = this.foundItems;
        localStorage[storageKey + 'autoProduceCount'] = this.autoProduceCount;
        localStorage[storageKey + 'craftedItems'] = this.craftedItems;

    };

    this.load = function() {
        var storageKey = this._getStorageKey();
        this.manualDigCount = utils.loadInt(storageKey + 'manualDigCount', "0");
        this.manualGatherCount = utils.loadInt(storageKey + 'manualGatherCount', "0");
        this.manualScavengeCount = utils.loadInt(storageKey + 'manualScavengeCount', "0");
        this.autoDigCount = utils.loadInt(storageKey + 'autoDigCount', "0");
        this.autoGatherCount = utils.loadInt(storageKey + 'autoGatherCount', "0");
        this.autoScavengeCount = utils.loadInt(storageKey + 'autoScavengeCount', "0");
        this.autoRefineCount = utils.loadInt(storageKey + 'autoRefineCount', "0");
        this.foundItems = utils.loadInt(storageKey + 'foundItems', "0");
        this.autoProduceCount = utils.loadInt(storageKey + 'autoProduceCount', '0');
        this.craftedItems = utils.loadInt(storageKey + 'craftedItems', '0');
    };

    this.reset = function(fullReset) {
        localStorage.setValue(this.manualDigCount, "0");
        localStorage.setValue(this.manualGatherCount, "0");
        localStorage.setValue(this.manualScavengeCount, "0");
        localStorage.setValue(this.autoDigCount, "0");
        localStorage.setValue(this.autoGatherCount, "0");
        localStorage.setValue(this.autoScavengeCount, "0");
        localStorage.setValue(this.autoRefineCount, "0");
        localStorage.setValue(this.foundItems, "0");
        localStorage.setValue(this.autoProduceCount, "0");
        localStorage.setValue(this.craftedItems, "0");
    };
};
