require(["jquery", "tooltipster", "enums"]);
UISlot.prototype = new UIComponent();
UISlot.prototype.$super = parent;
UISlot.prototype.constructor = UISlot;

function UISlot(id, parent) {
    this.id = id;

    this.parent = parent;

    this.controlType = 'UISlot';
    this.classes = 'hasMenu itemSlot itemSlotNonHover';

    this.mainDiv = undefined;
    this.iconDisplay = undefined;
    this.countDisplay = undefined;

    this.isClear = true;

    this.displayZero = false;

    this.canDrag = true;
    this.canDrop = true;

    this.item = undefined;

    this.onClick = undefined;

    this.count = 0;

    // ---------------------------------------------------------------------------
    // overrides
    // ---------------------------------------------------------------------------
    this.baseInit = this.init;

    // ---------------------------------------------------------------------------
    // main functions
    // ---------------------------------------------------------------------------
    this.init = function() {
        this.baseInit();

        this.mainDiv.hover(
            function() {
                $(this).addClass("itemSlotHover");
                $(this).removeClass("itemSlotNonHover");
            },
            function() {
                $(this).addClass("itemSlotNonHover");
                $(this).removeClass("itemSlotHover");
            }
        );

        this.mainDiv.mousedown({
            self: this
        }, this.onMouseDown);
        this.mainDiv.mouseup({
            self: this
        }, this.onMouseUp);
        this.mainDiv.mouseover({
            self: this
        }, this.onMouseOver);
        this.mainDiv.dblclick({
            self: this
        }, this.onDoubleClick);
    };

    // ---------------------------------------------------------------------------
    // events
    // ---------------------------------------------------------------------------
    this.onMouseDown = function(parameters) {
        var self = parameters.data.self;

        // utils.log('SlotMouseDown: ' + parameters.which+" " + self.item, true);
        // If we don't have content don't do anything
        if (!self.item) {
            return;
        }

        if (self.onClick) {
            self.onClick(self);
        }

        if (!self.canDrag) {
            return;
        }

        ui.beginDrag(self);
    };

    this.onMouseUp = function(parameters) {
        var self = parameters.data.self;

        // If we don't have content don't do anything
        if (!self.item) {
            return;
        }

        // Right click to activate the item context action
        if (parameters.which == MouseButtons.right) {
            game.activateItemContext(self.item.id, self.itemContext);
        }
    };

    this.onMouseOver = function(parameters) {
        var self = parameters.data.self;
        if (!ui.isDragging) {
            return;
        }

        var tryDropResult = self.tryDrop(ui.getDragSource());
        if (tryDropResult) {
            ui.setDragTarget(self);
        } else {
            ui.setDragTarget(undefined);
        }
    };

    this.onDoubleClick = function(parameters) {
        var self = parameters.data.self;

        // If we don't have content don't do anything
        if (!self.item) {
            return;
        }

        game.useItemContext(self.item.id);
    };

    // ---------------------------------------------------------------------------
    // slot functions
    // ---------------------------------------------------------------------------
    this.getMainElement = function() {
        return this.mainDiv;
    };

    this.generateItemTooltip = function(item) {
        content = "<strong>" + item.name + "</strong><br>";
		content += "<div style='font-size:11px;text-transform:capitalize;'>";
		if (item.description) content += "<strong>Description: </strong>" + item.description;
        switch (item.category) {
            case "rawMaterial":
				if (item.craftCost) {
					content += "<br><strong>Requires:</strong><br>";
					for (cost in item.craftCost) {
						content += "<br>&nbsp;&nbsp;&nbsp;" + item.craftCost[cost] + "&nbsp;" + game.getItemName(cost);
					}
				};
				if (item.el) content += "<br><strong>Symbol: </strong>" + item.el;
                break;
			case "component":
				if (item.craftCost) {
					content += "<br><strong>Crafted From:</strong>";
					for (cost in item.craftCost) {
						content += "<br>&nbsp;&nbsp;&nbsp;" + item.craftCost[cost] + "&nbsp;" + game.getItemName(cost);
					}
				};
				if (item.el) content += "<br><strong>Symbol: </strong>" + item.el;
                break;

			case "gem":
			case "machines":
			case "usable":
                break;
				
            case "miningGear":
			case "gearMainHand":
			case "gearHead":
			case "gearChest":
			case "gearLegs":
			case "gearFeet":
				if (!item.minimumMiningLevel) item.minimumMiningLevel = 0;
				content += "<br><strong>Mininum Mining Level: </strong>" + item.minimumMiningLevel + "<br>";
                content += "<strong>Stats:</strong>";
				content += "<br>&nbsp;&nbsp;&nbsp;Strength: " + item.strength;
				content += "<br>&nbsp;&nbsp;&nbsp;Accuracy: " + item.accuracy;
				content += "<br>&nbsp;&nbsp;&nbsp;Health: " + item.health;
				content += "<br>&nbsp;&nbsp;&nbsp;Defense: " + item.defense;
				content += "<br>&nbsp;&nbsp;&nbsp;Evasion: " + item.evasion;
				content += "<br>&nbsp;&nbsp;&nbsp;Counter: " + item.counter;
				content += "<br>&nbsp;&nbsp;&nbsp;Regeneration: " + item.regeneration;
				content += "<br>&nbsp;&nbsp;&nbsp;Resillience: " + item.resillience;
				content += "<br>&nbsp;&nbsp;&nbsp;Perception: " + item.perception;
				content += "<br>&nbsp;&nbsp;&nbsp;Experience: " + item.experience;
				content += "<br>&nbsp;&nbsp;&nbsp;Attack Speed: " + item.attackSpeed;
				content += "<br>&nbsp;&nbsp;&nbsp;Ship Speed: " + item.shipSpeed;
				content += "<br>&nbsp;&nbsp;&nbsp;Mining Luck: " + item.miningLuck;
				content += "<br>&nbsp;&nbsp;&nbsp;Loot Luck: " + item.lootLuck;
				content += "<br>&nbsp;&nbsp;&nbsp;Scavenge Luck: " + item.scavengeLuck;
                break;

            case "spaceShip":
                if (item.storageLimit) content += "<strong>Storage Limit: </strong>" + item.storageLimit + "<br>";
                break;

            case "scavenge":
				if (item.craftCost) {
					content += "<br>";
					content += "<strong>Decomposes To:</strong>";
					for (cost in item.craftCost) {
						content += "<br>&nbsp;&nbsp;&nbsp;" + item.craftCost[cost] + "&nbsp;" + game.getItemName(cost);
					}
				};
                break;
            
            case "building":
				if (item.craftCost) {
					content += "<br><strong>Requires:</strong>";
					for (cost in item.craftCost) {
						content += "<br>&nbsp;&nbsp;&nbsp;" + item.craftCost[cost] + "&nbsp;" + game.getItemName(cost);
					}
				};
				if (item.autoMine || item.autoGather || item.autoRefine || item.autoScavenge) {
					content += "<br><br><strong>Effects:</strong><br>";
					content += "Auto Digs Per Second: " + item.autoMine + "<br>";
                	content += "Auto Gathers Per Second: " + item.autoGather + "<br>";
                	content += "Auto Decomposes Per Second: " + item.autoRefine + "<br>";
					content += "Auto Scavenges Per Second: " + item.autoScavenge;
				};
				if (item.autoProduce) content += "<br><br>Auto Produce: <b>5 " + item.autoProduce + " per minute.</b>";
				if (item.statChange) {
					x = [];
					$.each(JSON.parse(game.getItem(item.id).statChange), function(key, value) {
						x.push(key + ": <b>+" + value + "</b>");
					});
					content += "<br><strong>Droprate Increase: </strong>" + x;
				}
                content += "<br><strong>Planet Limit:</strong> " + item.planetLimit + "<br>";
                break;
        };
        content += "<br><strong>Category:</strong> " + ItemCategory[item.category];
        content += "</div>";
        return content;
    };

    this.set = function(item, count) {
        this.item = item;
        this.count = count;

        var icon = item.icon || game.getDefaultItemIcon(item);

        this.iconDisplay = $('<img class="itemSlotIcon" src="' + sys.iconRoot + icon + '"/>');
        this.countDisplay = $('<div class="itemSlotText"></div>');
        this.menuHelper = $('<div style="display:none;" id="' + this.item.id + '"/>');

        this.mainDiv.attr('title', item.name);
        $("#" + this.id).tooltipster({
            content: this.generateItemTooltip(item),
            theme: 'tooltipster-multi',
            contentAsHTML: true,
            position: "right",
            onlyOne: true,
            speed: 1,
			maxWidth: 380,
			positionTracker: true
			//offsetX: -10,
			//offsetY: 5
        });
        this.mainDiv.append(this.iconDisplay);
        this.mainDiv.append(this.countDisplay);
        this.mainDiv.append(this.menuHelper);
        this.update(count);
    };

    this.update = function(count) {
        if (!count) count = 0;
        this.count = count;

        var countDisplayValue = count.formatNumber();
        if (count <= 0) {
            countDisplayValue = this.displayZero ? '0' : '';
        };

        this.countDisplay.text(countDisplayValue);
    };

    this.clear = function() {
        this.item = undefined;
        this.count = 0;

        if ($("#" + this.id).hasClass("tooltipstered")) {
            $("#" + this.id).tooltipster("destroy");
        }
        this.mainDiv.empty();
        this.mainDiv.attr('title', '');
    };

    this.tryDrop = function(other) {
        if (!this.canDrop || !other || !other.controlType || other.controlType != this.controlType) {
            return false;
        }

        // Right now we don't allow dragging onto occupied slots, will fix later
        if (this.item) {
            return false;
        }

        // Todo
        return true;
    };

    this.drop = function(other) {
        // Todo: Test code only, have to clean this up
        this.set(other.item, other.count);
        this.update(other.count);
        other.clear();
        other.update();
    };
};
