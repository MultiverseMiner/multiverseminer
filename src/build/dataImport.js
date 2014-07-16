module.exports = function (grunt) {
	var path = require('path');
	var fs = require('fs');
	var xls = require('xlsjs');
	
	var dataRoot = 'assets/data/';
	
	// helper function
	function getJsonValue(key, value, indentation) {
		var safeValue = value.replace('\'', '\\\'');
		if(!indentation) indentation = '';
		
		if(!isNaN(value)) {
			return indentation+'\''+key+'\': '+safeValue+',';
		}
		
		return indentation+'\''+key+'\': \''+safeValue+'\',';
	};
	
	function writeHeader(target) {
		target.push('// ------------------------------------------------------------------------');
		target.push('// AUTO-GENERATED, DO NOT EDIT MANUALLY');
		target.push('//  Generated @ '+new Date().toString());
		target.push('// ------------------------------------------------------------------------');
		target.push('');
	};
	
	function writeSectionHeader(target, content) {
		target.push('\t// -------------------------------------------');
		target.push('\t// '+content);
		target.push('\t// -------------------------------------------');
	};
	
	function validateBasics(row) {
		var id = row['id'];
		if(id === undefined) {
			return false;
		}
		
		return true;
	};
	
	function importData(sourceFiles, destFile, sectionKey) {
		var importData = [];
		writeHeader(importData);
		importData.push((sectionKey || 'Items') + ' = {');
		for(var sourceFile in sourceFiles) {
			var staticData = sourceFiles[sourceFile];
			var workbook = xls.readFile(dataRoot + sourceFile);
			var sheetNames = workbook.SheetNames;
			var sheet = xls.utils.sheet_to_row_object_array(workbook.Sheets[sheetNames[0]]);
			grunt.log.write('\nImporting: '+sourceFile+'\n');
			
			writeSectionHeader(importData, sourceFile);
			for(var r = 0; r < sheet.length; r++) {
				grunt.log.write('.');
				var row = sheet[r];
				var craftCost = [];
				var currentCraftCostEntry = undefined;
				
				if(!validateBasics(row)) {
					throw new Error("Basic validation failed for row " + r + " in " + sourceFile);
				}
				
				// Write the entry head
				importData.push('\t\''+row['id']+'\': {');
				
				// Write out the static data
				for(var key in staticData) {
					importData.push(getJsonValue(key, staticData[key], '\t\t'));					
				}
				
				// Check the extra columns
				for(column in row) {
					var value = row[column];
					var columnName = column;
					column = column.toLowerCase();
					
					// Skip underscore columns and some other special ones
					if(column[0] === '_' || row[columnName] === undefined) {
						continue;
					}

					if(column.indexOf('craft') === 0) {
						// Todo: Crafting cost
						if(column[column.length - 1] === '#') {
							if(!value || value === '') {
								// No crafting info set
								continue;
							}
							
							if(!currentCraftCostEntry) {
								throw new Error("Invalid data, row " + r + " in " + sourceFile);
							}
							
							currentCraftCostEntry.push(value);
							craftCost.push(currentCraftCostEntry);
							currentCraftCostEntry = undefined;
						} else {
							currentCraftCostEntry = [value];
						}
						
						continue;
					}
					
					// just write it out, no special treatment
					importData.push(getJsonValue(columnName, row[columnName], '\t\t'));
				}
				
				if(craftCost.length > 0) {
					importData.push('\t\t\'craftCost\': {');
					for(var n = 0; n < craftCost.length; n++) {
						importData.push(getJsonValue(craftCost[n][0], craftCost[n][1], '\t\t\t'));
					}
					
					importData.push('\t\t},');
				}
				
				importData.push('\t},');
			}
			
			importData.push('');
			
		}
		
		importData.push('}');
		var fd = fs.openSync(destFile, 'w');
		fs.write(fd, importData.join('\n'));
		fs.close(fd);
	};
	
	grunt.registerMultiTask('dataImport', 'Import the data from xls', function() {
		
		var enums = require('../enums');
		
		grunt.log.write('\n Importing data ...\n');
		fs.mkdir('tmp');
		
		// Items		
		var sourceFiles = {
				'buildings.xls': {'category': 'building'},
				'components.xls': {'category': 'component'},
		        'gear - chest.xls': {'category': 'gearChest', 'gearType': 'chest'},
		        'gear - feet.xls': {'category': 'gearFeet', 'gearType': 'feet'}, 
		        'gear - head.xls': {'category': 'gearHead', 'gearType': 'head'},
		        'gear - legs.xls': {'category': 'gearLegs', 'gearType': 'legs'}, 
		        'gear - picks.xls': {'category': 'miningGear', 'gearType': 'miningGear'},
		        'gear - weapons.xls': {'category': 'gearMainHand', 'gearType': 'mainHand'},
		        'gems.xls': {'category': 'gem'},
		        'materials.xls': {'category': 'rawMaterial'},
		        'potions.xls': {'category': 'usable'},
		        'scavenge.xls': {'category': 'scavenge'},
                'spaceship.xls': {'category': 'spaceship'}
		};
		importData(sourceFiles, 'src/data/items.js');
		
		// Loot
		/*sourceFiles = {
			'loot.xls': {},	
		};
		importData(sourceFiles, 'src/data/loot_autogen.js', 'LootTables');*/

		// Planets
		sourceFiles = {
			'planets.xls': {}
		};
		importData(sourceFiles, 'src/data/planets_autogen.js', 'Planets');
		
		// Races
		sourceFiles = {
			'races.xls': {}
		};
		importData(sourceFiles, 'src/data/races.js', 'Races');
		
		// NPC
		sourceFiles = {
			'actors.xls': {}
		};
		importData(sourceFiles, 'src/data/actors.js', 'Actors');
	});
};