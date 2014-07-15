require([ "uislot" ]);

UIInventory.prototype = new UIComponent();
UIInventory.prototype.$super = parent;
UIInventory.prototype.constructor = UIInventory;

function UIInventory(id, parent) {
    this.id = id;
    this.parent = parent;
    this.classes = 'itemGrid';
    
    this.slotCount = 15;
    
    this.itemContext = undefined;
    
    this.slotElements = [];
    this.slotIdItemIdMap = [];
    
    this.currentPage = 0;
    this.maxPage = 0;
    
    this.storage = undefined;
    this.category = undefined;
    
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
        var slotId = 0;
        
        for(var x = 0; x < this.slotCount; x++) {
            var slot = new UISlot(this.id + '_' + x, this.mainDiv);
            slot.itemContext = this.itemContext;
            slot.init();

            this.slotElements.push(slot);
            this.slotIdItemIdMap.push(undefined);
            this._clearSlot(slotId);
            slotId++;
        }
    };
    this.update = function(currentTime) {
    	if(!this.baseUpdate(currentTime)) {
    		return false;
    	};
    	
        var items = undefined;
        if(this.storage) {
        	if(this.category) {
        		items = this.storage.getItemsOfCategory(this.category);
        	} else {
        		items = this.storage.getItems();
        	}
        }
        // Update the paging info
        if(items) {
            this.maxPage = items.length / this.slotElements.length;
        } else {
            this.maxPage = 0;
        }
        
        if(this.currentPage > this.maxPage) {
            this.currentPage = 0;
        }
        
        // Determine which items we are to update
        var pageStart = this.currentPage * this.slotElements.length;
        var pageEnd = pageStart + this.slotElements.length;
        if(items) {
            if(pageEnd > items.length) {
                pageEnd = items.length;
            }
        } else
        {
            pageEnd = pageStart;
        }
        
        // Get the list of all items we are displaying right now
        var itemsToUpdate = [];
        for(var i = pageStart; i < pageEnd; i++) {
            itemsToUpdate.push(items[i]);
        }
        
        // Clear out slots that contain items we do not display
        for(var i = 0; i < this.slotIdItemIdMap.length; i++) {
            var itemId = this.slotIdItemIdMap[i];
            if(!itemId) {
                continue;
            }

            if($.inArray(itemId, itemsToUpdate) == -1) {
                this._clearSlot(i);
                this.slotIdItemIdMap[i] = undefined;
            };
        };
        
        // update the slots for all items
        for(var i = 0; i < itemsToUpdate.length; i++) {
            var itemId = itemsToUpdate[i];
            var item = game.getItem(itemId);
            var itemCount = this.storage.getItemCount(itemId);
                        
            var slotId = this._getSlot(itemId);
            if(slotId == undefined) {
                slotId = this._occupySlot(itemId);
                
                // New occupied slot, have to add the content
                slot = this.slotElements[slotId];
                slot.set(item, itemCount);
            } else {
                // Already occupied, just update the count
            	this.slotElements[slotId].update(itemCount);
            }
        };
    };
    
    this.setCategory = function(categoryId) {
        this.category = game.getCategoryKeyById(categoryId);
        this.invalidate();
        // READ CURRENT CATEGORY
        //console.log(this.category);
    };
    
    this.setStorage = function(storage) {
    	this.storage = storage;
    	this.invalidate();
    };
    
    // ---------------------------------------------------------------------------
    // internal functions
    // ---------------------------------------------------------------------------
    this._clearSlot = function(slotId) {
    	this.slotElements[slotId].clear();
    };
    
    this._getSlot = function(itemId) {
        for(var i = 0; i < this.slotIdItemIdMap.length; i++) {
            if(this.slotIdItemIdMap[i] == itemId) {
                return i;
            }
        }
    };
    
    this._occupySlot = function(itemId) {
        for(var i = 0; i < this.slotElements.length; i++) {
            if(!this.slotIdItemIdMap[i]) {
                this.slotIdItemIdMap[i] = itemId;
                return i;
            }
        }
    };
};