require(["data/system", "data/items", "data/loot", "data/planets", "data/actors", "game", "ui", "jquery", "jqueryui", "enums", "utils", "uiplanetscreen", "noty", "joyride", "toolbar", "contextmenu", "remote/socket"]);

// Create components
var game = new Game();
var ui = new UI();
var socket = undefined;
var uiplanetscreen = new UIPlanetScreen();

// Save before closing the page.
window.onbeforeunload = function() {
    game.save();
};
// Add hook for document ready
$(document).ready(onDocumentReady);

// Setup notifications
$.jGrowl.defaults.position = 'bottom';
$.jGrowl.defaults.animateOpen = {
    height: 'show'
};
$.jGrowl.defaults.life = 300;
$.jGrowl.defaults.pool = 1;

Number.prototype.formatNumber = function() {
    if (ui.numberFormatter) {
        return ui.numberFormatter(this).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return this;
};

// ---------------------------------------------------------------------------
// function hooks
// ---------------------------------------------------------------------------

function onDocumentReady() {
    //Initialize the audio
    $('#audioDig').trigger('load');
    $('#audioDigSuccess').trigger('load');

    //Initialize components
    game.init();
    ui.init();
    ui.bindKey("d", onMine);
    ui.bindKey("g", onGather);
    ui.bindKey("s", onScavenge);

    // Call one round of UI Updates
    //ui.update();

    // Activate the default panels
    onActivatePlayerInventory();
    onActivatePlayerGear();

    // Set the update interval
    var interval = 1000 / 60;
    setInterval(function() {
        onUpdate();
    }, interval);

    // Right Click Menus
    $(document).on('mousedown', '.hasMenu', function(e) {
        e.preventDefault();
        var item = game.getItem($("div:last-child", this).attr("id"));
        if (e.which === 3 && item !== undefined) {
            $(this).contextmenu({
                menu: function() {
                    var menu = [{
                        title: "Info",
                        action: function(event, ui) {
                            var itemName = item.name,
                                itemDescription = item.description,
                                dialogDiv = $("#itemInfo");

                            dialogDiv.dialog({
                                title: "Item Info: " + itemName,
                                autoOpen: true
                            });

                            dialogDiv.html("<p>Name: " + itemName + "</p>");

                            if (itemDescription === undefined) {
                                itemDescription = "A mysterious item.";
                            }

                            dialogDiv.append("<p>Description: " + itemDescription + "</p>");
                        }
                    }];

                    // Equipment
                    if (game.player.canEquip(item.id)) {
                        var currentEquip = game.player.gear.getItemInSlot(item.gearType);
                        if (currentEquip !== undefined) {
                            currentEquip = game.getItem(currentEquip);
                        }

                        // Equip text to show in the menu
                        var equipText = "Unequip";
                        if (currentEquip === undefined || currentEquip.id !== item.id) {
							equipText = "Equip";
                        }

                        if (typeof item.minimumMiningLevel !== "undefined" && item.minimumMiningLevel <= game.player.miningLevel) {
	                        menu.push({
	                            title: equipText,
	                            action: function(event, ui) {
	                                if (game.player.hasEquipped(item.gearType) && item.id === currentEquip.id) {
	                                    game.player.unEquip(item.gearType);
	                                } else {
	                                    game.player.equip(item.id);
	                                }
	                                game.player.update();
	                            }
	                        });
						};
                    };

                    // Buildings
                    // If the planet limit is less than the total that exists on the planet
                    if (~item.category.indexOf('building')) {
                        if (~e.target.id.indexOf('planet')) {
                            menu.push({
                                title: "Remove from planet",
                                action: function(event, ui) {
                                    try {
                                        game.moveItems(item.id, game.currentPlanet.storage, game.player.storage, 1);
                                        game.currentPlanet.storage.setStorageChanged(true);
                                        game.currentPlanet._updateStats();
                                        game.currentPlanet.update();
                                    } catch (e) {
                                        noty({
                                            layout: 'bottomCenter',
                                            type: 'error',
                                            timeout: 1500,
                                            text: "An error was encountered when trying to move the building."
                                        });
                                        return;
                                    }
                                }
                            });
                        }
                        if (~e.target.id.indexOf('player') && parseInt(item.planetLimit, 10) > parseInt(game.currentPlanet.storage.getItemCount(item.id), 10)) {
                            menu.push({
                                title: "Construct on planet",
                                action: function(event, ui) {
                                    try {
                                        game.moveItems(item.id, game.player.storage, game.currentPlanet.storage, 1);
										game.currentPlanet.storage.setStorageChanged(true);
                                        game.currentPlanet._updateStats();
                                        game.currentPlanet.update();
                                    } catch (e) {
                                        noty({
                                            layout: 'bottomCenter',
                                            type: 'error',
                                            timeout: 1500,
                                            text: "An error was encountered when trying to move the building."
                                        });
                                        return;
                                    }
                                }
                            });
                        }
                    }
                    // Decompose
                    if (game.player.canDecomposeItem(item)) {
                        menu.push({
                            title: "Decompose All",
                            action: function(event, ui) {
                                game.player.decomposeScavenged();
                            }
                        });
                    }

                    // Trash
                    if (game.player.storage.hasItem(item.id)) {
                        menu.push({
                            title: "Trash",
                            action: function(event, ui) {
                                if (e.target.id.slice(0, 6) == "planet") {
                                    game.player.storage.removeItem(item.id, game.player.storage.getItemCount(item.id));
                                } else {
                                    game.currentPlanet.storage.removeItem(item.id, game.currentPlanet.storage.getItemCount(item.id));
                                }
                            }
                        });
                    };
                    return menu;
                }
            });
        }
    });
   	game.player.updateUI();
	$('#settings').toolbar({
        content: '#user-toolbar-options',
        position: "bottom",
        hideOnClick: true
    });
    $(".tooltip").tooltipster({
        theme: 'tooltipster-multi',
        contentAsHTML: true,
        position: "left",
        onlyOne: true,
        interactiveTolerance: 10,
        speed: 1,
        offsetX: 0,
        offsetY: 0
    });
    $(".tooltip2").tooltipster({
        theme: 'tooltipster-multi',
        position: "bottom",
        onlyOne: true,
        delay: 0,
        timer: 2000,
        interactiveTolerance: 10,
        speed: 1,
        positionTracker: true,
        offsetX: 0,
        offsetY: 0
    });
	obj = {"gatheringLevel":0, "gatheringXP":0, "scavengingLevel":0, "scavengingXP":0, "miningLevel":0, "miningXP":0};
	for (var key in obj) {
		if (key == "gatheringLevel") tipContent = "This is your current <b>gathering level</b>.<p>Each time you increase your level you unlock bonuses.";
		if (key == "gatheringXP") tipContent = "This is your current <b>gathering XP<b>.<p>You gain xp each time you find an item while gathering. <br>When you have enough xp, you will level.";
		if (key == "scavengingLevel") tipContent = "This is your current <b>scavenging level</b>.<p>Each time you increase your level you unlock bonuses.";
		if (key == "scavengingXP") tipContent = "This is your current <b>scavenging XP</b>. <p>You gain xp each time you find an item while scavenging. <br>When you have enough xp, you will level.";
		if (key == "miningLevel") tipContent = "This is your current <b>mining level</b>. <p>Each time you increase your level you unlock bonuses.";
		if (key == "miningXP") tipContent = "This is your current <b>mining XP</b>.<p>You gain xp each time you find an item while mining.<br>When you have enough xp, you will level.";
		$("#" + key).tooltipster({
			contentAsHTML: true,
			content: tipContent,
			theme: 'tooltipster-multi',
			position: "left",
			onlyOne: true,
			delay: 0,
			interactiveTolerance: 10,
			speed: 1,
			maxWidth: 300
		});
	};
	this.hasTips = false;
};

function selectClass(playerClass) {
    game.player.playerClass = playerClass;
    $("#class-pick").dialog("close");
    game.save();
};

function tutorial() {
    $('#joyRideTipContent').joyride({
        autoStart: true,
        postStepCallback: function(index, tip) {
            if (index == 2) {
                $(this).joyride('set_li', false, 1);
            }
        },
        modal: false,
        expose: true
    });
};

function onUpdate() {
    var currentTime = Date.now();
    game.update(currentTime);
    ui.update(currentTime);
	if (!this.hasTips) {
		var stats = uiplanetscreen.listStats();
		for (var key in stats) {
			tipContent = undefined;
			if (key == "accuracy") tipContent = "Accuracy increases your chance to hit your opponent.";
			if (key == "attackSpeed") tipContent = "Attack speed determines how times per round you attack.";
			if (key == "counter") tipContent = "Counter allows you a free strike after being attacked.";
			if (key == "defense") tipContent = "Defense negates some damage you take from enemies.";
			if (key == "evasion") tipContent = "Evasion will sometimes allow you to dodge an attack.";
			if (key == "experience") tipContent = "Experience will compound any xp you gain from combat.";
			if (key == "health") tipContent = "This is how many health points you currently have. When it hits 0 you die.";
			if (key == "lootLuck") tipContent = "Increases the quality, or quantity of loot found.";
			if (key == "miningLuck") tipContent = "Increases your chance to find loot.";
			if (key == "perception") tipContent = "Decreases your chance to be attacked while performing actions, like scavenge, or flying.";
			if (key == "regeneration") tipContent = "Regeneration determines how much health you restore per second.";
			if (key == "resillience") tipContent = "Resillience will lower the effect time of negative statuses, like Shrink, or Slow.";
			if (key == "scavengeLuck") tipContent = "Scavenge Luck increases your chat to find multiple items at once, and increases quality";
			if (key == "strength") tipContent = "Strength is factored in to damage, and actions like mining.";
			if (key == "travelSpeed") tipContent = "Travel Speed modifies the amount of time it takes you to travel between planets.";
			if (key == "totalPower") tipContent = "Total Power is a combination of Mining Luck, and Power, and allows you to find more elements.";
			if (typeof tipContent !== "undefined") {
				$("." + key).tooltipster({
					content: tipContent,
					theme: 'tooltipster-multi',
					position: "left",
					onlyOne: true,
					delay: 0,
					interactiveTolerance: 10,
					speed: 1,
					maxWidth: 225
				});
			};
		};
		this.hasTips = true;
		delete stats;
		game.player.updateUI();
	};
};

function openNotifications() {
    $("#notification-list").dialog({
        close: function(event, ui) {
            localStorage.setItem('notification_count', 0);
            localStorage.setItem('notification_text', "");
        }
    });
};

function newCraft(itemId, quantity) {
    if (itemId == undefined) {
        utils.logError("onCraft with no item specified.");
        return false;
    }
    if (quantity == undefined) {
        quantity = 1;
    };
    if (quantity == "max") quantity = game.player.storage.getMaxCrafts(itemId);
    try {
        if (game.player.craft(itemId, quantity)) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.log(e);
    };
};

function onCraft(what) {
    if (what == undefined) {
        utils.logError("onCraft with invalid target");
        return;
    }

    if (game.player.craft(what)) {
        ui.screenPlanet.componentCrafting.invalidate();
    }
};

function exportStorage() {
	try {
		$.modal.close();
	} catch (e) {};
    // encode the data into base64
    base64 = window.btoa(JSON.stringify(localStorage));
    var x = base64;
    content = '<strong>Export your Game</strong><br>Remove ALL gear before saving.<br>Ctrl+A to select your saved game';
    content += '<textarea class="selectExportGame" cols="43" rows="20">' + x + '</textarea>';
	$.modal.close();
    $.modal(content, {
        opacity: 80,
        escClose: true,
        containerId: 'exportBox',
        focus: true,
        overlayCss: {
            backgroundColor: "#000"
        }
    });
}

function importStorage() {
	try {
		$.modal.close();
	} catch (e) {};
    content = '<strong>Import a Saved Game</strong><br>Paste your save below.';
    content += '<textarea cols="43" rows="19" class="selectImportGame"></textarea>';
    content += '<p><button onclick="doImport()">Import</button>';
    $.modal(content, {
        opacity: 80,
        escClose: true,
        containerId: 'importBox',
        focus: true,
        overlayCss: {
            backgroundColor: "#000"
        }
    });
}

function doImport() {
    encoded = $(".selectImportGame").val();
    var decoded = JSON.parse(window.atob(encoded));
    game.reset();
    $.each(decoded, function(k, v) {
        window.localStorage.setItem(k, v);
    });
};

function toggleAudio() {
    //pause playing
    if (!document.getElementById('audioDig').muted) {
        document.getElementById('audioDig').muted = true;
        document.getElementById('audioDigSuccess').muted = true;
        $("#audioDig").trigger('stop');
        $("#audioDigSuccess").trigger('stop');
        noty({
            text: "Audio muted.",
            type: "notification",
            timeout: 1000
        });
    } else {
        document.getElementById('audioDig').muted = false;
        document.getElementById('audioDigSuccess').muted = false;
        noty({
            text: "Audio unmuted.",
            type: "notification",
            timeout: 1000
        });
    }
};

function togglePopup() {
    //pause playing
    game.settings.togglePopups();
    if (!game.settings.showPopups) {
        noty({
            text: "Loot text disabled.",
            type: "information",
            timeout: 2000
        });
    } else {
        noty({
            text: "Loot text enabled.",
            type: "information",
            timeout: 2000
        });
    }
};

// Mining, Gathering, Scavenging Modals //

function goMining() {
    $("#miningModal").modal({
        modal: false,
        escClose: true,
        overlayClose: true,
        opacity: 1,
        overlayCss: {
            backgroundColor: "#000"
        },
        onShow: function(dialog) {
            $(dialog.container).draggable({
                handle: 'div'
            });
        },
        position: ["15%", "36%"],
        containerId: 'miningBox'
    });
};
function planetLootModal() {
    $("#planetLootModal").modal({
	    modal: false,
	    escClose: true,
	    overlayClose: true,
	    opacity: 1,
	    overlayCss: {
	        backgroundColor: "#000"
	    },
	    onShow: function(dialog) {
	        $(dialog.container).draggable({
	            handle: 'div'
	        });
	    },
	    position: ["15%", "36%"],
	    containerId: 'planetLootModal'
	});
}

function goGathering() {
    $("#gatheringModal").modal({
        modal: false,
        escClose: true,
        overlayClose: true,
        opacity: 1,
        overlayCss: {
            backgroundColor: "#000"
        },
        onShow: function(dialog) {
            $(dialog.container).draggable({
                handle: 'div'
            });
        },
        position: ["15%", "36%"],
        containerId: 'gatheringBox'
    });
};

function goScavenging() {
    $("#scavengingModal").modal({
        modal: false,
        escClose: true,
        overlayClose: true,
        opacity: 1,
        overlayCss: {
            backgroundColor: "#000"
        },
        onShow: function(dialog) {
            $(dialog.container).draggable({
                handle: 'div'
            });
        },
        position: ["15%", "36%"],
        containerId: 'scavengingBox'
    });
};
// Mining, Gathering, Scavenging Modals End

function onMine() {
    if (!$("#miningModal").is(':visible')) {
        $.modal.close();
        goMining();
    };
    if (game.playerDied > 0) return false;
    if (this.lastRun !== "undefined") {
        if (this.lastRun >= ~~new Date() / 200 | 0) {
            return false;
        };
    };
    game.settings.addStat('manualDigCount');
    if ($("#leftCategory2").hasClass("genericButtonSelected")) uiplanetscreen.updateStatsPanel();
    result = game.player.mine();
    if (result) {
        $('#audioDigSuccess').trigger('play');
    } else {
        $('#audioDig').trigger('play');
    }
    this.lastRun = ~~new Date() / 200 | 0;
};

function onGather() {
    if (!$("#gatheringModal").is(':visible')) {
        $.modal.close();
        goGathering();
    };
    if (game.playerDied > 0) return false;
    if (this.lastRun !== "undefined") {
        if (this.lastRun >= ~~new Date() / 200 | 0) {
            return false;
        };
    };
    game.settings.addStat('manualGatherCount');
    if ($("#leftCategory2").hasClass("genericButtonSelected")) uiplanetscreen.updateStatsPanel();
    game.player.gather();
    this.lastRun = ~~new Date() / 200 | 0;
};

function onScavenge() {
    if (!$("#scavengingModal").is(':visible')) {
        if (game.playerDied > 0 || game.currentPlanet.data.id != "1") {
            return false;
        };
        $.modal.close();
        goScavenging();
    };
    if (this.lastRun !== "undefined") {
        if (this.lastRun >= ~~new Date() / 200 | 0) {
            return false;
        };
    };
    game.settings.addStat('manualScavengeCount');
    if ($("#leftCategory2").hasClass("genericButtonSelected")) uiplanetscreen.updateStatsPanel();
    game.player.scavenge();
    this.lastRun = ~~new Date() / 200 | 0;
};

function onActivatePlayerInventory() {
    // select the button
    changeLeftCategoryButton(0);

    // disable and hide
    ui.screenPlanet.activatePlayerInventory();
}

function onActivateCrafting() {
    // select the button
    changeRightCategoryButton(3);

    ui.screenPlanet.activateCrafting();
};

function onActivateEmpire() {
    // select the button
    changeLeftCategoryButton(1);

    ui.screenPlanet.activateEmpire();
};

function onActivateStats() {
    // select the button
    changeLeftCategoryButton(2);

    ui.screenPlanet.activateStats();
};

function onActivateQuests() {
    changeLeftCategoryButton(3);
    ui.screenPlanet.activateQuests();
}

function onActivatePlayerGear() {
    // select the button
    changeRightCategoryButton(0);

    ui.screenPlanet.activatePlayerGear();
};

function onActivateShip() {
    // select the button
    changeRightCategoryButton(1);

    ui.screenPlanet.activatePlayerShip();
};

function onActivatePlanet() {
    // select the button
    changeRightCategoryButton(2);

    ui.screenPlanet.activatePlanet();
};

function onMovePlanetItemsToPlayer() {
    game.movePlanetItemsToPlayer();
};

function onSave() {
    game.save();
    noty({
        text: "Auto-saved.",
        type: "notification",
        timeout: 500
    });
};

function onPlayerDied() {
    game.playerDied = new Date();
    $('#mineButton')[0].classList.add("hidden");
    $('#gatherButton')[0].classList.add("hidden");
    $('#scavengeButton')[0].classList.add("hidden");
    $('#fightButton')[0].classList.add("hidden");
};

function doReset() {
    game.wasReset = true;
    game.reset();
    onActivatePlayerInventory();
    onActivatePlayerGear();
};

function onTravelToPlanet(target) {
    if (!game.canTravelTo(target)) {
        return;
    }
    //$("#solarsystem").modal.close();
    $.modal.close();
    $(".panelBottom").hide();
    $(window).one("scroll", function() {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    });
    ui.screenPlanet.hide();
    ui.screenTravel.show();
    game.travelTo(target);
    $(".panelBottom").show();
};

function onSetInventoryFilter(filter) {
    ui.inventoryPlayerCategoryFilter = filter;
    ui.updateComponent(ui.componentPlayerInventory);
    ui.inventoryPlanetCategoryFilter = filter;
    ui.updateComponent(ui.componentPlayerInventory);
}

function showFight() {
    if (game.playerDied > 0)
        return false;
    $("#fight-dialog").dialog({
        title: "Fight",
        minWidth: 350,
        minHeight: "auto"
    }).bind('dialogclose', function(event) {
        $("#fightText").val("");
        game.currentFight.disableFight();
    });
    game.currentFight = new Fight();
    game.currentFight.init();
}

function onReset() {
    $("#resetModal").modal({
        onShow: function(dialog) {
            $(dialog.container).draggable({
                handle: 'div'
            });
        },
        opacity: 80,
        escClose: true,
        overlayClose: true,
        overlayCss: {
            backgroundcolor: "#000"
        },
        containerId: 'resetDialog'
    });
}

function spaceTravel() {
    $("#solarsystem").load('solar.html').modal({
        opacity: 100,
        height: 20,
        escClose: true,
        overlayClose: true,
        overlayCss: {
            backgroundColor: "#000",
            backgroundImage: "url('assets/images/stardust.jpg')"
        },
        containerId: 'spaceTravelMap'
    });
}

function showChangeLog() {
    $("#changeLog").load('changelog.html').modal({
        opacity: 60,
        height: 50,
        escClose: true,
        overlayClose: true,
        overlayCss: {
            backgroundColor: "#000"
        },
        containerId: 'changesLog'
    });
}

function changeLeftCategoryButton(selected) {
    for (var i = 0; i < 4; i++) {
        var name = document.getElementById("leftCategory" + i);
        name.className = "genericButton categoryButton clickable";
    }

    var name = document.getElementById("leftCategory" + selected);
    name.className = "genericButtonSelected categoryButton clickable";
}

function changeRightCategoryButton(selected) {
    for (var i = 0; i < 4; i++) {
        var name = document.getElementById("rightCategory" + i);
        name.className = "genericButton categoryButton clickable";
    }

    var name = document.getElementById("rightCategory" + selected);
    name.className = "genericButtonSelected categoryButton clickable";
}

function characterSelect() {
    var src = "character.html";

    $.modal('<iframe src="' + src + '"height="590" width="1020" frameBorder="0">', {
        closeHTML: "",
        //onShow: function(dialog) { $(dialog.container).draggable({handle: 'div'}); },
        opacity: 90,
        escClose: true,
        overlayClose: true,
        overlayCss: {
            backgroundColor: "#000"
        },
        containerId: 'characterSelect'
    });
}
