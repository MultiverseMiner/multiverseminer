require(["uicomponent", "uiinventory", "uiselection", "game"]);

UIPlanetScreen.prototype = new UIComponent();
UIPlanetScreen.prototype.$super = parent;
UIPlanetScreen.prototype.constructor = UIPlanetScreen;

function UIPlanetScreen() {
	this.id = 'planetScreen';

	this.parent = undefined;

	this.playerInventoryFilter = undefined;
	this.playerInventory = undefined;

	this.planetInventoryFilter = undefined;
	this.planetInventory = undefined;

	this.componentLeftPanel = undefined;
	this.componentRightPanel = undefined;

	this.componentPlayerInventory = undefined;
	this.componentCrafting = undefined;
	this.componentEmpire = undefined;
	this.componentStats = undefined;

	this.componentPlayerGear = undefined;
	this.componentPlayerShip = undefined;
	this.componentPlanet = undefined;

	this.componentPlanetDisplay = undefined;
	this.componentQuestsPanel = undefined;

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

		this.playerInventoryFilter = new UISelection('playerInventoryFilter');
		this.playerInventoryFilter.values = ItemCategory;
		this.playerInventoryFilter.callback = this.onPlayerInventoryFilterChanged;
		this.playerInventoryFilter.min = 0;
		this.playerInventoryFilter.max = 11;
		this.playerInventoryFilter.init();
		this.playerInventoryFilter.setSelection(0);

		this.playerInventory = new UIInventory('playerInventorySlots', 56);
		this.playerInventory.setStorage(game.player.storage);
		this.playerInventory.slotCount = 56;
		this.playerInventory.init();
		this.playerInventory.setCategory(0);

		this.planetInventoryFilter = new UISelection('planetInventoryFilter');
		this.planetInventoryFilter.values = ItemCategoryPlanet;
		this.planetInventoryFilter.callback = this.onPlanetInventoryFilterChanged;
		this.planetInventoryFilter.min = 0;
		delete this.planetInventoryFilter.values['component'];
		delete this.planetInventoryFilter.values['miningGear'];
		delete this.planetInventoryFilter.values['gearMainHand'];
		delete this.planetInventoryFilter.values['gearHead'];
		delete this.planetInventoryFilter.values['gearChest'];
		delete this.planetInventoryFilter.values['gearLegs'];
		delete this.planetInventoryFilter.values['gearFeet'];
		delete this.planetInventoryFilter.values['spaceship'];
		this.planetInventoryFilter.max = 3;
		this.planetInventoryFilter.init();
		this.planetInventoryFilter.setSelection(0);

		this.planetInventory = new UIInventory('planetInventorySlots', 56);
		this.planetInventory.slotCount = 56;
		this.planetInventory.init();
		this.planetInventory.setCategory(0);

		this.componentLeftPanel = new UIComponent('panelPlanetLeft');
		this.componentLeftPanel.init();

		this.componentRightPanel = new UIComponent('panelPlanetRight');
		this.componentRightPanel.init();

		this.componentPlayerInventory = new UIComponent('playerInventoryPanel');
		this.componentPlayerInventory.init();
		this.componentPlayerInventory.updateCallback = this.updatePlayerInventoryPanel;

		this.componentCrafting = new UIComponent('playerCraftingPanel');
		this.componentCrafting.init();
		this.updateCraftingPanel();
		this.componentCrafting.updateCallback = this.updateCraftingPanel;

		this.componentEmpire = new UIComponent('empirePanel');
		this.componentEmpire.init();
		this.componentEmpire.updateCallback = this.updateEmpirePanel;

		this.componentStats = new UIComponent('statsPanel');
		this.componentStats.init();
		this.componentStats.updateCallback = this.updateStatsPanel;

		this.componentPlayerGear = new UIComponent('playerGearPanel');
		this.componentPlayerGear.itemContext = game.itemContexts.playerGear;
		this.componentPlayerGear.init();
		this.componentPlayerGear.updateCallback = this.updatePlayerGearPanel;

		this.componentPlayerShip = new UIComponent('playerShipPanel');
		this.componentPlayerShip.itemContext = game.itemContexts.playerShip;
		this.componentPlayerShip.init();
		this.componentPlayerShip.updateCallback = this.updateShipPanel;

		this.componentPlanet = new UIComponent('planetPanel');
		this.componentPlanet.itemContext = game.itemContexts.planetGear;
		this.componentPlanet.init();
		this.componentPlanet.updateCallback = this.updatePlanetPanel;

		this.componentPlanetDisplay = new UIComponent('planetDisplay');
		this.componentPlanetDisplay.init();
		this.componentPlanetDisplay.enabled = true;
		this.componentPlanetDisplay.updateCallback = this.updatePlanetDisplay;

		this.componentQuestsPanel = new UIComponent('questsPanel');
		this.componentQuestsPanel.init();
		this.componentQuestsPanel.updateCallback = this.updateQuestsDisplay;

		// Activate some defaults
		this.activatePlayerInventory();
		this.activatePlayerGear();

		var divs = {
			"Minerals": {
				"dictionaryIndex": [101],
				"divId": "planetMinerals"
			},
			"Gases": {
				"dictionaryIndex": [100],
				"divId": "planetGases"
			},
			"Scavenge": {
				"dictionaryIndex": [1000],
				"divId": "planetScavenge"
			},
			"Gems": {
			    "dictionaryIndex": [102, 103],
			    "divId": "planetGems"
			}
		};

		for (var name in divs) {
			var html = name + ': ';

			for (var i = 0; i < divs[name]['dictionaryIndex'].length; i++) {
				var index = divs[name]['dictionaryIndex'][i];
				for (var j = 0; j < game.lootTableDictionary[index].entries.length; j++) {
					if (j != 0 || i > 0) {
						html += ', ';
					}
					if (name == 'Gems') {
						html += game.getItemName(game.lootTableDictionary[index].entries[j]);
					} else {
						html += game.getItemName(game.lootTableDictionary[index].entries[j][0]);
					}
				}
			}
			$('#' + divs[name]['divId']).html(html);
		}
	};

	this.update = function(currentTime) {
		if (!this.baseUpdate(currentTime)) {
			return false;
		};
		// Check for gear changes
		if (game.player.gear.gearChanged) {
			this.componentPlayerGear.invalidate();
			game.player.gear.gearChanged = false;
		}

		// Check for inventory changes
		if (game.player.storage.getStorageChanged()) {
			this.playerInventory.invalidate(currentTime);
			this.planetInventory.invalidate(currentTime);
			this.componentCrafting.invalidate(currentTime);
			game.player.storage.setStorageChanged(false);
		}

		// Check for planet updates
		if (game.currentPlanet) {
			if (game.currentPlanet.storage.getStorageChanged()) {
				this.planetInventory.invalidate();
				game.currentPlanet.storage.setStorageChanged(false);
			}
		}

		// Check for planet change
		if (game.getPlanetChanged()) {
			this.planetInventory.setStorage(game.currentPlanet.storage);
			this.componentPlanetDisplay.invalidate();
			game.setPlanetChanged(false);

			// Temporary place to switch on / off the planet options
			if (game.currentPlanet.data.miningLootTableId) {
				$('#mineButton').show();
			} else {
				$('#mineButton').hide();
			}

			if (game.currentPlanet.data.gatherLootTableId) {
				$('#gatherButton').show();
			} else {
				$('#gatherButton').hide();
			}

			if (game.currentPlanet.data.scavengeLootTableId) {
				$('#scavengeButton').show();
			} else {
				$('#scavengeButton').hide();
			}
		}

		// Update the components
		this.playerInventoryFilter.update(currentTime);
		this.playerInventory.update(currentTime);

		this.planetInventoryFilter.update(currentTime);
		this.planetInventory.update(currentTime);

		this.componentPlayerInventory.update(currentTime);
		this.componentCrafting.update(currentTime);
		this.componentEmpire.update(currentTime);

		this.componentPlayerGear.update(currentTime);
		this.componentPlayerShip.update(currentTime);
		this.componentPlanet.update(currentTime);

		this.componentPlanetDisplay.update(currentTime);
		this.componentQuestsPanel.update(currentTime);

	};

	this.show = function() {
		this.isVisible = true;
		this.mainDiv.show().animate({
			opacity: 1
		}, 500);
		this.componentLeftPanel.show("left");
		this.componentRightPanel.show("right");
		this.invalidate();
		//game.clearItemContexts();
	};

	this.hide = function() {
		this.isVisible = false;
		this.mainDiv.animate({
			opacity: 0
		}, 500, function() {
			$(this).hide();
		});
		this.componentLeftPanel.hide("left");
		this.componentRightPanel.hide("right");

		//game.clearItemContexts();
	};

	// ---------------------------------------------------------------------------
	// specific functions
	// ---------------------------------------------------------------------------
	this.updatePlayerInventoryPanel = function() {
		var self = ui.screenPlanet;
		self.playerInventory.update(game.player.storage);
	};

	this.updatePlanetInventoryPanel = function() {
		var self = ui.screenPlanet;

		if (!game.currentPlanet) {
			return;
		}
		self.planetInventory.update(game.currentPlanet.storage);
	};

	this.listStats = function() {
		stats = game.player.gear.getStats();
		stats["totalPower"] = game.player.calculatePower();
		return stats;
	};

	this.updatePlayerGearPanel = function() {
		var self = ui.screenPlanet;
		var parent = $('#playerGearSlots');
		parent.empty();
		var gearSlots = game.player.gear.getSlots();
		for (var i = 0; i < gearSlots.length; i++) {
			var itemId = game.player.gear.getItemInSlot(gearSlots[i]);
			var slot = ui.buildGearSlot('playerGear', gearSlots[i], itemId, parent);
			slot.itemContext = self.componentPlayerGear.itemContext;
			parent.append(slot.getMainElement());
		};
		stats = game.player.gear.getStats();
		stats["totalPower"] = game.player.calculatePower();
		y = [];
		Object.keys(stats).forEach(function(key) {
			var value = stats[key];
			if (isNaN(value)) {
				value = 0;
			};
			y.push('<tr><td class="' + key + '">' + key.split(/(?=[A-Z])/g).join(' ').toLowerCase() + '</td><td>' + value + '</td></tr>');
		});
		$("#minerGearStats").html('<div class=\'statTable\'><table id="panel"><tbody><tr><td>Stats</td><td>#</td></tr>' + y.join(''));
	};

	this.buildCraftingTooltip = function(item) {
        content = "<strong>" + item.name + "</strong><br>";
		content += "<div style='font-size:11px;text-transform:capitalize;'>";
		if (item.description) content += "<strong>Description: </strong>" + item.description + "<br>";
		switch (item.category) {
			case "rawMaterial":
				if (item.craftCost) {
					content += "<p><strong>Requires:</strong></br>";
					for (cost in item.craftCost) {
						content += "&nbsp;" + game.getItemName(cost) + " x " + item.craftCost[cost] + "&nbsp;(" + game.player.storage.getItemCount(cost) + ")</br>";
					}
				}
				if (item.el) {
					if (item.el) content += "<br><strong>Symbol: </strong>" + item.el;
				}
				break;

			case "component":
				if (item.craftCost) {
					content += "<p><strong>Crafted From:</strong></br>";
					for (cost in item.craftCost) {
						content += "&nbsp;" + game.getItemName(cost) + " x " + item.craftCost[cost] + "&nbsp;(" + game.player.storage.getItemCount(cost) + ")</br>";
					}
				}
				break;

			case "miningGear":
			case "gearHead":
			case "gearChest":
			case "gearMainHand":
			case "gearLegs":
			case "gearFeet":
				if (!item.minimumMiningLevel) item.minimumMiningLevel = 0;
				content += "<br><strong>Mininum Mining Level: </strong>" + item.minimumMiningLevel + "<br><br>";
				if (item.craftCost) {
					content += "<strong>Requires:</strong></br>";
					for (cost in item.craftCost) {
						content += "&nbsp;" + game.getItemName(cost) + " x " + item.craftCost[cost] + "&nbsp;(" + game.player.storage.getItemCount(cost) + ")</br>";
					}
				}
				content += "<p><strong>Stats:</strong></br>";
				content += "&nbsp;Strength: " + item.strength + "</br>";
				content += "&nbsp;Accuracy: " + item.accuracy + "</br>";
				content += "&nbsp;Health: " + item.health + "</br>";
				content += "&nbsp;Defense: " + item.defense + "</br>";
				content += "&nbsp;Evasion: " + item.evasion + "</br>";
				content += "&nbsp;Counter: " + item.counter + "</br>";
				content += "&nbsp;Regeneration: " + item.regeneration + "</br>";
				content += "&nbsp;Resillience: " + item.resillience + "</br>";
				content += "&nbsp;Perception: " + item.perception + "</br>";
				content += "&nbsp;Experience: " + item.experience + "</br>";
				content += "&nbsp;Attack Speed: " + item.attackSpeed + "</br>";
				content += "&nbsp;Ship Speed: " + item.shipSpeed + "</br>";
				content += "&nbsp;Mining Luck: " + item.miningLuck + "</br>";
				content += "&nbsp;Loot Luck: " + item.lootLuck + "</br>";
				content += "&nbsp;Scavenge Luck: " + item.scavengeLuck + "</br>";
				break;

				/* Buildings */
			case "building":
				if (item.craftCost) {
					content += "<strong>Requires:</strong></br>";
					for (cost in item.craftCost) {
						content += "&nbsp;" + game.getItemName(cost) + " x " + item.craftCost[cost] + "&nbsp;(" + game.player.storage.getItemCount(cost) + ")</br>";
					}
				}
				if (item.autoMine || item.autoGather || item.autoRefine || item.autoScavenge) {
					content += "<br><strong>Effects:</strong><br>";
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

				/* Spaceship */
			case "spaceship":
				if (item.craftCost) {
					content += "<strong>Requires:</strong></br>";
					for (cost in item.craftCost) {
						content += "&nbsp;" + game.getItemName(cost) + " x " + item.craftCost[cost] + "&nbsp;(" + game.player.storage.getItemCount(cost) + ")</br>";
					}
				}
				break;
		};
		if (item.storageLimit) content += "<strong>Storage Limit: </strong>" + item.storageLimit + "<br>";
		content += "<br><strong>Category:</strong>" + ItemCategory[item.category];
		content += "</div>";
		return content;
	};

	this.updateCraftingPanel = function() {
		function addTooltip(element, item) {
			element.tooltipster({
				content: self.buildCraftingTooltip(item),
				theme: 'tooltipster-multi',
				contentAsHTML: true,
				position: "left",
				onlyOne: true,
				interactiveTolerance: 10,
				offsetX: 0,
				offsetY: 0,
				speed: 10
			});
		}
		var self = ui.screenPlanet;
		var parent = $('#playerCraftingContent');
		if (parent.html() !== "") {
			var craftableContent = parent.children(":nth-child(2)"); // assuming child 1 is [Crafting] header
			for (var key in ItemCategory) {
				if (key == 'scavenge') continue;
				var items = game.getItemsByCategory(key);
				if (!items || items.length <= 0) {
					continue;
				}
				// TODO: Move this somewhere else and make it take other storages into account
				for (var i = 0; i < items.length; i++) {
					var item = items[i];
					if (item.id) {
						var maxCraftable = game.player.storage.getMaxCraftableItems(item.id);
						if (maxCraftable > 0 && craftableContent.find(".craft_" + item.id).length == 0) {
							var entry = self.buildCraftingEntry(item);
							craftableContent.append(entry);
							addTooltip(entry, item);
						}
						var element = $('.craft_' + item.id);
						var jxMax = element.find(".craftMax");
						element.find(".craft1").css("visibility", maxCraftable >= 1 ? "visible" : "hidden");
						element.find(".craft10").css("visibility", maxCraftable >= 10 ? "visible" : "hidden");
						element.find(".craft100").css("visibility", maxCraftable >= 100 ? "visible" : "hidden");
						if (maxCraftable > 0) {
							element.removeClass('craftDisabled').addClass('craftEnabled');
							jxMax.html(" x " + maxCraftable.toFixed() + " ");
						} else {
							element.addClass('craftDisabled');
							jxMax.html("");
						}
						var qty = game.player.storage.getItemCount(item.id);
						element.find(".craftingCount").html(qty > 0 ? (" (" + qty + ")") : "");
					}
				}
				craftableContent.find(".craftDisabled").remove();
			}
			// Skip re-building this for now
			return;
		}
		parent.append('<p>Available</p>').append($('<div/>'));

		for (var key in ItemCategory) {
			// Todo: remove this when scavenging items no longer have craftCost as their attribute
			if (key === 'scavenge') {
				continue;
			}

			var items = game.getItemsByCategory(key);
			if (!items || items.length <= 0) {
				continue;
			}

			var craftableItems = [];
			for (var i = 0; i < items.length; i++) {
				if (items[i].craftCost && game.player.storage.canAdd(items[i].id)) {
					craftableItems.push(items[i]);
				}
			}

			if (craftableItems.length <= 0) {
				continue;
			}

			function countProperties(craftableItems) {
				var count = 0;
				for (var prop in craftableItems) {
					if (craftableItems.hasOwnProperty(prop))
					++count;
				}
				return count;
			}

			var headerContent = $('<div>');
			parent.append('<p>' + ItemCategory[key] + '&nbsp;(' + countProperties(craftableItems) + ')</p>').append(headerContent);
			for (var i = 0; i < craftableItems.length; i++) {
				var entry = self.buildCraftingEntry(craftableItems[i]);
				headerContent.append(entry);
				addTooltip(entry, craftableItems[i]);
			}
		}
		$("#playerCraftingContent").accordion({
			heightStyle: "content",
			collapsible: true,
			active: false
		});
		input = $('.filterinput').prepend('<form id="formdiv"><input class="filterinput" type="text" data-type="search" /></form><br>').parent();
		$('.filterinput').on('input', function() {
			var a = $(this).val();
			if (a.length > 0) {
				var containing = $('.craftingItemPanel').filter(function() {
					return $(this).text().toLowerCase().indexOf(a.toLowerCase()) + 1;
				}).slideDown();
				$('.craftingItemPanel').not(containing).slideUp();
			} else {
				$('.craftingItemPanel').slideDown();
			}
			return false;
		});
	};

	this.updateEmpirePanel = function() {
		// Todo
	};

	this.updateStatsPanel = function() {
		var x = [];
		var myObj = game.settings.totalStats;
		Object.keys(myObj).forEach(function(prop) {
			if (myObj.hasOwnProperty(prop) && prop !== 'key' && typeof myObj[prop] != 'function' && prop != 'id') {
				if (myObj[prop] == null) myObj[prop] = 0;
				x.push('<tr><td class="' + prop + '">' + prop.split(/(?=[A-Z])/g).join(' ').toLowerCase() + '</td><td>' + myObj[prop] + '</td></tr>');
			};
		});
		$("#statsContent").html('<div class=\'statTable\'><table><tbody><tr><td>Stats</td><td>#</td></tr>' + x.join(''));
	};

	this.updateShipPanel = function() {
		// TODO
	};

	this.updatePlanetPanel = function() {
		// TODO
	};

	// Questing Section (650-704)
	this.updateQuestsDisplay = function() {
		// TODO
		$('#questsContent').empty();
		for (var i = 0; i < game.QuestTable.length; i++) {
			var quest = game.QuestTable[i];
			var dom = $("<span class='questTitle'>" + quest.name + "</span><br>");
			var expandQuest = $("<span class='expandQuest'>Open</span>");
			if (quest.completed)
				dom.addClass('questCompleted');
			expandQuest.mousedown({
				'self': dom,
				'quest': quest
			}, function(a) {
				uiplanetscreen._buildTaskList(a.data.self, a.data.quest);
			});
			dom.append(expandQuest);
			$('#questsContent').append(dom);
		}
		$('#questsContent').disableSelection();
	};

	this._buildTaskList = function(dom, quest) {
		var taskList = $("#taskList");
		if (taskList)
			taskList.remove();
		var last = 0;
		var div = $("<div id='taskList'></div>");
		var ul = $("<ul class='taskList'></ul>");
		for (var i = 0; i < quest.tasks.length; i++) {
			var task = quest.tasks[i];
			var li = $("<li class='taskItem'>" + task.desc + "</li>");
			if (quest.ordered) {
				if (task.completed) {
					last = i;
					li.addClass("taskCompleted");
				} else if (i == (last + 1)) {
					li.addClass("taskCurrent");
				} else {
					li.addClass("taskUnavailable");
				}
			} else {
				if (task.completed)
					li.addClass("taskCompleted");
				else
					li.addClass("taskCurrent");
			}
			ul.append(li);
		}
		div.append("<div class='questDescription'>-&nbsp;" + quest.desc + "</div>");
		div.append(ul);
		div.dialog({
			modal: true
		});
	};

	this.activateQuests = function() {
		this.hideLeftSideComponents();
		this.componentQuestsPanel.show();
	};


	this.updatePlanetDisplay = function() {
		$('#planetDisplayBackground').empty();
		$('#planetDisplayNameText').empty();
		if (game.currentPlanet) {
			var background = game.currentPlanet.getBackground();
			if (background) {
				if (game.currentPlanet.getName() === "Earth") {
					$('#planetDisplayBackground').append('<img class="planetBigEarth" src="assets/images/bigEarth.png"/>');
				} else {
					$('#planetDisplayBackground').append('<img class="planetImage" src="' + background + '"/>');
				}
			}
			$('#planetDisplayNameText').text(game.currentPlanet.getName().toUpperCase());
		}
	};

	this.onPlayerInventoryFilterChanged = function() {
		var self = ui.screenPlanet;
		var category = self.playerInventoryFilter.selection;
		game.settings.selectedPlayerInventoryFilter = category;
		self.playerInventory.setCategory(category);
		self.componentPlayerInventory.invalidate();
	};

	this.onPlanetInventoryFilterChanged = function() {
		var self = ui.screenPlanet;
		var category = self.planetInventoryFilter.selection;
		game.settings.selectedPlanetInventoryFilter = category;
		self.planetInventory.setCategory(category);
		self.componentPlanet.invalidate();
	};

	this.hideLeftSideComponents = function() {
		this.componentPlayerInventory.hide();
		this.componentEmpire.hide();
		this.componentStats.hide();
		this.componentQuestsPanel.hide();
	};

	this.hideRightSideComponents = function() {
		this.componentPlayerGear.hide();
		this.componentPlayerShip.hide();
		this.componentPlanet.hide();
		this.componentCrafting.hide();
	};

	this.activatePlayerInventory = function() {
		this.hideLeftSideComponents();
		this.componentPlayerInventory.show();
	};

	this.activateCrafting = function() {
		this.hideRightSideComponents();
		this.componentCrafting.show();
	};

	this.activateEmpire = function() {
		this.hideLeftSideComponents();
		this.componentEmpire.show();
	};

	this.activateStats = function() {
		this.updateStatsPanel();
		this.hideLeftSideComponents();
		this.componentStats.show();
	};

	this.activatePlayerGear = function() {
		this.hideRightSideComponents();
		this.componentPlayerGear.show();
	};

	this.activatePlayerShip = function() {
		this.hideRightSideComponents();
		this.componentPlayerShip.show();
	};

	this.activatePlanet = function() {
		this.hideRightSideComponents();
		this.componentPlanet.show();
	};

	this.buildCraftingEntry = function(item) {
		var tooltipContent = ui.buildCraftingCostTooltip(item);
		var content = $('<div id="craftitem" class="craft_' + item.id + ' craftingItemPanel"/>');

		var icon = game.getDefaultItemIcon(item);
		if (item.icon) {
			icon = item.icon;
		}

		if (item.planetLimit == "1" || item.category.indexOf("building") != -1 || item.category.indexOf("gear") != -1) {
			if (item.category.indexOf("building") != -1) {
				actionText = "Build";
			} else {
				actionText = "Craft";
			}
			content.append('<image class="craftingIcon" src="' + sys.iconRoot + icon + '" />');
			content.append('<span id="craftingText" class="craftingText">' + item.name + '</span>');
			content.append('<span class="craftingCount"></span><br>');
			content.append('<span class="craft1"   onclick="newCraft(\'' + item.id + '\',1);(arguments[0] || event || window.event).stopPropagation();">&nbsp;&nbsp;' + actionText + '&nbsp;&nbsp;</span>');
			content.disableSelection();
		} else {
			content.append('<image class="craftingIcon" src="' + sys.iconRoot + icon + '" />');
			content.append('<span id="craftingText" class="craftingText">' + item.name + '</span>');
			content.append('<span class="craftingCount"></span><br>');
			content.append('<span class="craft1"   onclick="newCraft(\'' + item.id + '\',1);(arguments[0] || event || window.event).stopPropagation();">&nbsp;&nbsp;Craft&nbsp;&nbsp;</span>');
			content.append('<span class="craft10"  onclick="newCraft(\'' + item.id + '\',10);(arguments[0] || event || window.event).stopPropagation();">&nbsp;&nbsp;Craft (10)&nbsp;&nbsp;</span>');
			content.append('<span class="craft100" onclick="newCraft(\'' + item.id + '\',100);(arguments[0] || event || window.event).stopPropagation();">&nbsp;&nbsp;Craft (100)&nbsp;&nbsp;</span>');
			// content.append('<span class="craftMax" onclick="newCraft(\'' + item.id + '\',\'max\');(arguments[0] || event || window.event).stopPropagation();"></span>');
			content.disableSelection();
		}
		return content;
	};
}
