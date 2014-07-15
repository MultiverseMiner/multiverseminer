UISelection.prototype = new UIComponent();
UISelection.prototype.$super = parent;
UISelection.prototype.constructor = UISelection;

function UISelection(id, parent) {
    this.id = id;
    this.parent = parent;

    this.values = undefined;
    this.callback = undefined;
    this.keys = undefined;

    this.min = 0;

    this.selection = 0;
    this.selectionTextElement = undefined;

    // ---------------------------------------------------------------------------
    // overrides
    // ---------------------------------------------------------------------------
    this.baseInit = this.init;
    this.baseUpdate = this.update;

    // ---------------------------------------------------------------------------
    // main functions
    // ---------------------------------------------------------------------------
    this.init = function() {
        this.baseInit();

        if (!this.values || !this.callback) {
            throw new Error("Values and callback must be set!");
        }

        this.keys = Object.keys(this.values);
        this.min = 0;
        this.selection = game.settings.selectedPlanetInventoryFilter = game.settings.selectedPlayerInventoryFilter = 1;

        this.selectionFirstElement = $('<img class="selectPrevious clickable" src="' + sys.selectionArrowBackFast + '"/>');
        this.selectionFirstElement.click({
            self: this
        }, this.onSelectFirst);

        this.selectionPrevElement = $('<img class="selectPrevious clickable" src="' + sys.selectionArrowBack + '"/>');
        this.selectionPrevElement.click({
            self: this
        }, this.onSelectPrevious);

        this.selectionTextElement = $('<div class="selectionText"></div>');

        this.selectionNextElement = $('<img class="selectNext clickable" src="' + sys.selectionArrowForward + '"/>');
        this.selectionNextElement.click({
            self: this
        }, this.onSelectNext);

        this.selectionLastElement = $('<img class="selectNext clickable" src="' + sys.selectionArrowForwardFast + '"/>');
        this.selectionLastElement.click({
            self: this
        }, this.onSelectLast);

        // have to add the right floating elements first
        this.mainDiv.append(this.selectionLastElement);
        this.mainDiv.append(this.selectionNextElement);

        this.mainDiv.append(this.selectionFirstElement);
        this.mainDiv.append(this.selectionPrevElement);
        this.mainDiv.append(this.selectionTextElement);
    };

    this.update = function(currentTime) {
        if (!this.baseUpdate(currentTime)) {
            return;
        };
        // this.selectionTextElement.text(key.replace("gear", "").split(/(?=[A-Z])/g).join(' ').toLowerCase());
        try {
            var key = this.keys[this.selection];
            this.selectionTextElement.text(key.split(/(?=[A-Z])/g).join(' ').toLowerCase());
        } catch (e) {
            var key = "rawMaterial";
            this.selectionTextElement.text(key.split(/(?=[A-Z])/g).join(' ').toLowerCase());
        }
        this.invalidate();
    };

    this.setSelection = function(id) {
        if (!this.keys[id]) {
            utils.logError("setSelection called with invalid id: " + id);
            return;
        }
        this.selection = id;
        this.invalidate();
    };

    this.selectPrevious = function() {
        if (!this.selection || this.selection > this.max) {
            this.selection = this.max;
        } else {
            this.selection--;
        }
        this.invalidate();
        this.callback(this.selection);
    };

    this.selectNext = function() {
        if (this.selection == this.max) {
            this.selection = this.min;
        } else {
            this.selection++;
        }
        this.invalidate();
        this.callback(this.selection);
    };
    this.onSelectFirst = function(parameter) {
        var self = parameter.data.self;
        self.selection = self.min;
        self.selection++;
        self.selectPrevious();
    };

    this.onSelectPrevious = function(parameter) {
        var self = parameter.data.self;
        self.selectPrevious();
    };

    this.onSelectNext = function(parameter) {
        var self = parameter.data.self;
        self.selectNext();
    };
    this.onSelectLast = function(parameter) {
        var self = parameter.data.self;
        self.selection = self.max;
        self.selection--;
        self.selectNext();
    };
};
