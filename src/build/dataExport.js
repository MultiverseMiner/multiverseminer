module.exports = function (grunt) {
	
	grunt.registerMultiTask('dataExport', 'Export the data to xls compatible csv format', function() {
		var path = require('path');
		var fs = require('fs');
		
		var sys = require('../../assets/data/system');
		GLOBAL.sys = sys.sys;
		
		var items = require('../../assets/data/items.js');
		var loot = require('../../assets/data/loot.js');
		var planets = require('../../assets/data/planets.js');
		
		var buildDictionary = function(list) {
			var result = {};
			var keys = Object.keys(list);
			for ( var i = 0; i < keys.length; i++) {
				var entry = list[keys[i]];
				if (result[entry.id]) {
					utils.logError("Duplicate id: " + entry.id);
					continue;
				}

				result[entry.id] = entry;
			}

			return result;
		};
				
		var itemDictionary = buildDictionary(items.items);
		
		grunt.log.write('\n Exporting data to csv...\n');
		fs.mkdir('tmp');
		
		// Open items
		var destFile = 'tmp/items.csv';
		var fd = fs.openSync(destFile, 'w');
		for(var key in items.items) {
			var item = items.items[key];
			var values = [item.id, key, item.icon || '', item.name || '', item.description || '', item.baseValue || '', item.el || ''];
			
			var craftKeys = [];
			if(item.craftCost) {
				craftKeys = Object.keys(item.craftCost);
			}
			
			for(var i =0; i < 10; i++) {
				if(craftKeys.length > i) {
					values.push(itemDictionary[craftKeys[i]].internalName);
					values.push(item.craftCost[craftKeys[i]]);
				} else {
					values.push('');
					values.push('');
				}
			}
			
			fs.write(fd, values.join(',')+'\n' );
		};
		fs.close(fd);
	});
};