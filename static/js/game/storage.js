function Storage(id) {
	this.id = id;
	
	this.storageChanged = false;
	
	// ---------------------------------------------------------------------------
	// general
	// ---------------------------------------------------------------------------
	this.initialize = function() {
	    this.reset();
	};

	// ---------------------------------------------------------------------------
	// storage functions
	// ---------------------------------------------------------------------------
	this.canAdd = function(id) {
		if (!this.items[id]) {
			return true;
		}

		var itemInfo = game.getItem(id);
		if(!itemInfo) {
			return false;
		}

		// See if this item has limited storage capacity
		var limit = game.getItem(id).storagelimit;
		if (!limit) {
			return true;
		}

		return limit < this.items[id];
	};

	this.addItem = function(id, value, silent) {
		if (!value) {
			value = 1;
		}

		// Get some info about the item we are adding
		var itemInfo = game.getItem(id);
		if (!itemInfo) {
			utils.logError("attempt to add unknown item: " + id);
			return false;
		}
		
		// Add it to the storage
		if (!this.items[id]) {
			this.items[id] = 0;
		}

		this.items[id] += value;
		
		// Register this item in the dictionaries
        this._registerItemDictionary(itemInfo, "category", this.itemCategoryDictionary);
        if(itemInfo.gearType) {
            this._registerItemDictionary(itemInfo, "gearType", this.gearTypeDictionary);
        }
		
		if(silent == undefined || !silent) {
		    this.storageChanged = true;
		}
		
		return true;
	};

	this.addItems = function(items) {
		for ( var i = 0; i < items.length; i++) {
			if(!this.addItem(items[i], 1, true)) {
				// Todo: rewind what we just added
				return false;
			}
		}
		
		if(items.length>0) {
            this.storageChanged = true;
        }
		return true;
	};

	this.hasItem = function(id) {
		return this.items[id] !== undefined;
	};

	this.getItem = function(id) {
		return this.items[id] || undefined;
	}

	this.getItems = function() {
		return Object.keys(this.items);
	};

	this.getItemsOfType = function(type) {
		if (!this.itemTypeDictionary[type]) {
			return;
		}

		return this.itemTypeDictionary[type];
	};
	
	this.getItemsOfCategory = function(category) {
		if (!this.itemCategoryDictionary[category]) {
			return;
		}
		
		return this.itemCategoryDictionary[category];
	};

	this.getItemCount = function(id) {
		if (!this.items[id]) {
			return 0;
		}

		return this.items[id];
	};

	this.removeItem = function(id, value) {
		if (!value) {
			value = 1;
		}

		// Get some info about the item we are adding
		var itemInfo = game.getItem(id);
		if (!itemInfo) {
			utils.logError("attempt to remove unknown item: " + id);
			return false;
		}
		
		if (!this.items[id] || this.items[id] < value) {
			utils.logError("RemoveItem of " + id
					+ " called with insufficient items: " + id + " was "
					+ this.items[id]);
			return false;
		}

		this.items[id] -= value;
		if (this.items[id] <= 0) {
			// We depleted the resource so we remove the entry
			delete this.items[id];
			
			// Remove this item from the settings to avoid cheating by reloading
			utils.deleteSetting(this._getStorageKey() + id);
			
			// Unregister from the dictionaries
			this._unregisterItemDictionary(itemInfo, "category", this.itemCategoryDictionary);
			if(itemInfo.gearType) {
				this._unregisterItemDictionary(itemInfo, "gearType", this.gearTypeDictionary);
			}
		}
		
		this.storageChanged = true;
		return true;
	};
	
	this.setItemMetadata = function(id, metadata) {
		this.itemMetadata[id] = metadata;
		this.storageChanged = true;
	};
	
	this.getItemMetadata = function(id) {
		return this.itemMetadata[id];
	};
	
	this.removeItemMetadata = function(id) {
		if(!this.itemMetadata[id]) {
			return;
		}
		
		delete this.itemMetadata[id];
		this.storageChanged = true;
	};
	
	this.setStorageChanged = function(storageChanged) {
		this.storageChanged = storageChanged;
	};
	
	this.getStorageChanged = function() {
		return this.storageChanged;
	};

	/**
	 * Returns max amount of crafts with current resources. See also getMaxCraftableItems()
	 */
	this.getMaxCrafts = function (itemId) {
		var count = null;
		var item = game.itemDictionary[itemId];
		if (item.craftCost && game.player.storage.canAdd(item.id)) {
			var cost = game.getCraftingCost(item.id, 1);
			var keys = Object.keys(cost);
			for (var x = 0; x < keys.length; x++) {
				var key = keys[x];
				var n = game.player.storage.getItemCount(key) / cost[key];
				if (count == null || count > n) {
					count = n;
				}
			}
		}
		return Math.floor(count);
	};

	/**
	 * Returns maximum craftable output with current resources. See also getMaxCrafts()
	 */
	this.getMaxCraftableItems = function (itemId) {
		return this.getMaxCrafts(itemId) * (game.itemDictionary[itemId].craftResult || 1);
	};
	
	// ---------------------------------------------------------------------------
	// internal stuff, don't use outside
	// ---------------------------------------------------------------------------
	this._registerItemDictionary = function(itemInfo, property, dictionary) {
		var propertyValue = itemInfo[property];
		if (propertyValue) {
			if (!dictionary[propertyValue]) {
				dictionary[propertyValue] = [];
			}
			
			// Register this item in our dictionary if it's not there yet
			if (jQuery.inArray(itemInfo.id, dictionary[propertyValue]) == -1) {
				dictionary[propertyValue].push(itemInfo.id);
			}
		}
	};
	
	this._unregisterItemDictionary = function(itemInfo, property, dictionary) {
		var propertyValue = itemInfo[property];
		if (propertyValue) {
			if (!dictionary[propertyValue]) {
				return;
			}

			// Unregister the item
			var index = dictionary[propertyValue].indexOf(itemInfo.id);
			if (index >= 0) {
				dictionary[propertyValue].splice(index, 1);
			}
			
			// Clean up if this was the last item
			if (dictionary[propertyValue].length <= 0) {
				delete dictionary[propertyValue];
			}
		}
	};
	
	this._getStorageKey = function() {
		return 'storage_' + this.id + '_';
	};

	this._quickSort = function(items, left, right) {
		var index;
	    if (items.length > 1) {
	        index = this._partition(items, left, right);
	        if (left < index - 1) {
	            this._quickSort(items, left, index - 1);
	        }
	        if (index < right) {
	            this._quickSort(items, index, right);
	        }
	    }
	    return items;
	};

	this._partition = function(items, left, right) {
	    var pivot   = items[Math.floor((right + left) / 2)],
	        i       = left,
	        j       = right;
	    while (i <= j) {
	        while (items[i] < pivot) {
	            i++;
	        }
	        while (items[j] > pivot) {
	            j--;
	        }
	        if (i <= j) {
	            this._swap(items, i, j);
	            i++;
	            j--;
	        }
	    }
	    return i;
	};

	this._swap = function(list, firstIndex, secondIndex) {
		var temp = list[firstIndex];
	    list[firstIndex] = list[secondIndex];
	    list[secondIndex] = list;
	};

	// ---------------------------------------------------------------------------
	// loading / saving
	// ---------------------------------------------------------------------------
	this.save = function() {
		var storageKey = this._getStorageKey();

		var keys = Object.keys(this.items);
		for ( var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var value = this.items[key];
			localStorage[storageKey + key] = value;
		}
	};

	this.load = function() {
        this.items = {};
		var storageKey = this._getStorageKey();
		var keys = game.getItems();
		for ( var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (!localStorage[storageKey + key]) {
				continue;
			}
			this.addItem(key, utils.loadInt(storageKey + key, 0));
		}
		this.storageChanged = true;
	};
    
	this.reset = function(fullReset) {
		this.items = {};	
		this.itemCategoryDictionary = {};
	    this.gearTypeDictionary = {};
	    this.itemMetadata = {};
	    this.storageChanged = true;
	};
};
