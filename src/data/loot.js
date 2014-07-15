LootTables = {};

LootMode = {
    'single': 0,
    'multi': 1
};

exports.loot = LootTables;
exports.lootMode = LootMode;

//---------------------------------------------------------------------------
//helper functions
//---------------------------------------------------------------------------

function addTable(id, internalName, data) {
    var table = {
        'id': id,
        'mode': LootMode.multi,
        'entries': []
    };

    if (data == undefined || data.length <= 0) {
        throw new Error('Empty data in addTable');
    }

    for (var i = 0; i < data.length; i++) {
        table.entries.push(data[i]);
    }

    LootTables[internalName] = table;
    return table;
};

function addSingleTable(id, internalName, data) {
    var table = {
        'id': id,
        'mode': LootMode.single,
        'entries': []
    };

    if (data == undefined || data.length <= 0) {
        throw new Error('Empty data in addSingleTable');
    }

    for (var i = 0; i < data.length; i++) {
        table.entries.push(data[i]);
    }

    LootTables[internalName] = table;
    return table;
};

// ---------------------------------------------------------------------------
// Earth resources
// ---------------------------------------------------------------------------
addTable(100, 'earthAtmosphere', [
    [Items.argon.id, 0.009],
    [Items.carbonDioxide.id, 0.007],
    [Items.carbonMonoxide.id, 0.007],
    [Items.helium.id, 0.007],
    [Items.hydrogen.id, 0.05],
    [Items.krypton.id, 0.009],
    [Items.methane.id, 0.009],
    [Items.neon.id, 0.009],
    [Items.nitrogen.id, 0.05],
    [Items.oxygen.id, 0.4]
]);

addTable(101, 'earthMinerals', [
    [Items.aluminaOxide.id, 0.009],
    [Items.aluminum.id, 0.0007],
    [Items.barium.id, 0.0005],
    [Items.boron.id, 0.00005],
    [Items.calcium.id, 0.015],
    [Items.carbon.id, 0.009],
    [Items.ceasium.id, 0.0009],
    [Items.chloride.id, 0.0015],
    [Items.chromium.id, 0.0027],
    [Items.coal.id, 0.00009],
    [Items.copper.id, 0.01],
    [Items.crudeOil.id, 0.009],
    [Items.fluorine.id, 0.0007],
    [Items.germanium.id, 0.009],
    [Items.gold.id, 0.009],
    [Items.iridium.id, 0.007],
    [Items.iron.id, 0.050],
    [Items.lime.id, 0.005],
    [Items.magnesium.id, 0.009],
    [Items.manganese.id, 0.009],
    [Items.neodymium.id, 0.009],
    [Items.nickel.id, 0.009],
    [Items.phosphorus.id, 0.009],
    [Items.potassium.id, 0.009],
    [Items.rhenium.id, 0.009],
    [Items.silicon.id, 0.009],
    [Items.silver.id, 0.009],
    [Items.sodium.id, 0.009],
    [Items.sulfur.id, 0.009],
    [Items.sulfurDioxide.id, 0.009],
    [Items.sulfuricAcid.id, 0.009],
    [Items.tin.id, 0.009],
    [Items.titanium.id, 0.0001],
    [Items.tungsten.id, 0.00009],
    [Items.water.id, 0.0009],
    [Items.xenon.id, 0.00009],
    [Items.zinc.id, 0.009]
]);

addSingleTable(102, 'earthGemsCommon', [
    Items.amber.id,
    Items.amethyst.id,
    Items.aquamarine.id,
    Items.emerald.id,
    Items.lapis.id,
    Items.quartz.id,
    Items.topaz.id
]);

addSingleTable(103, 'earthGemsRare', [
	Items.agate.id,
	Items.alexandrite.id,
	Items.almandineGarnet.id,
	Items.amazonite.id,
	Items.ametrine.id,
	Items.ammolite.id,
	Items.andalusite.id,
	Items.andesineLabradorite.id,
	Items.andraditeGarnet.id,
	Items.apatite.id,
	Items.aquamarine.id,
	Items.aventurine.id,
	Items.azurite.id,
	Items.blackOpal.id,
	Items.bloodstone.id,
	Items.boulderOpal.id,
	Items.carnelian.id,
	Items.chalcedony.id,
	Items.chariote.id,
	Items.chrysocolla.id,
	Items.chrysoprase.id,
	Items.chysoberyl.id,
	Items.citrine.id,
	Items.coral.id,
	Items.danburite.id,
	Items.diamond.id,
	Items.diaspore.id,
	Items.flourite.id,
	Items.goldenBeryl.id,
	Items.goshenite.id,
	Items.hawksEye.id,
	Items.heliodor.id,
	Items.hematite.id,
	Items.howlite.id,
	Items.iolite.id,
	Items.jade.id,
	Items.jadeite.id,
	Items.jasper.id,
	Items.kornerupine.id,
	Items.kunzite.id,
	Items.kyanite.id,
	Items.larimar.id,
	Items.lepidolite.id,
	Items.malachite.id,
	Items.melanite.id,
	Items.moldavite.id,
	Items.moonstone.id,
	Items.morganite.id,
	Items.obsidian.id,
	Items.omphaciteJade.id,
	Items.onyx.id,
	Items.opal.id,
	Items.pearl.id,
	Items.peridot.id,
	Items.rainbowMoonstone.id,
	Items.roseQuartz.id,
	Items.ruby.id,
	Items.rutilatedGems.id,
	Items.rutileQuartz.id,
	Items.rutileTopaz.id,
	Items.sapphire.id,
	Items.sodalite.id,
	Items.spessartiteGarnet.id,
	Items.tanzanite.id,
	Items.tigersEye.id,
	Items.tourmaline.id,
	Items.turquoise.id,
	Items.variscite.id,
	Items.zircon.id,
	Items.zultanite.id
]);

addTable(104, 'earthMining', [
    [LootTables.earthGemsRare, 0.0000008],
    [LootTables.earthGemsCommon, 0.00005],
    [LootTables.earthMinerals, 1]
]);

// ---------------------------------------------------------------------------
// Moon resources
// ---------------------------------------------------------------------------
addTable(200, 'moonAtmosphere', [
    [Items.oxygen.id, 0.43]
]);

addTable(201, 'moonMinerals', [
    [Items.silicon.id, 0.2],
    [Items.magnesium.id, 0.19],
    [Items.iron.id, 0.05],
    [Items.calcium.id, 0.03],
    [Items.aluminum.id, 0.03],
    [Items.chromium.id, 0.042],
    [Items.titanium.id, 0.018],
    [Items.manganese.id, 0.012]
]);

// ---------------------------------------------------------------------------
// Mars resources
// ---------------------------------------------------------------------------
addTable(300, 'marsAtmosphere', [
    [Items.carbonDioxide.id, .01]
]);

addTable(301, 'marsMinerals', [
    [Items.potassium.id, 0.05],
    [Items.magnesium.id, 0.1],
    [Items.sodium.id, 0.09],
    [Items.chloride.id, 0.09]
]);

// ---------------------------------------------------------------------------
// Venus resources
// ---------------------------------------------------------------------------
addTable(400, 'venusAtmosphere', [
    [Items.carbonDioxide.id, 1],
    [Items.nitrogen.id, 0.003],
    [Items.sulfurDioxide.id, 0.0015],
    [Items.argon.id, 0.0007],
    [Items.carbonMonoxide.id, 0.0017],
    [Items.neon.id, 0.0007],
    [Items.helium.id, 0.0012]
]);
addTable(401, 'venusMinerals', [
    [Items.silicon.id, 1.0],
    [Items.iron.id, 0.5]
]);

// ---------------------------------------------------------------------------
// Mercury resources
// ---------------------------------------------------------------------------
addTable(500, 'mercuryAtmosphere', [
    [Items.oxygen.id, .001],
    [Items.argon.id, .001],
    [Items.nitrogen.id, .001],
    [Items.carbonDioxide.id, .001],
    [Items.xenon.id, .001],
    [Items.krypton.id, .001],
    [Items.neon.id, .001],
    [Items.hydrogen.id, .022],
    [Items.helium.id, .006],
    [Items.potassium.id, .005]
]);
addTable(501, 'mercuryMinerals', [
    [Items.aluminum.id, .001],
    [Items.iron.id, 0.01],
    [Items.magnesium.id, .002],
    [Items.silicon.id, .001]
]);

// ---------------------------------------------------------------------------
// Jupiter resources
// ---------------------------------------------------------------------------
addTable(600, 'jupiterAtmosphere', [
    [Items.hydrogen.id, .090],
    [Items.helium.id, .01],
    [Items.neon.id, 0.0007],
    [Items.methane.id, 0.0001]
]);

// ---------------------------------------------------------------------------
// Saturn resources
// ---------------------------------------------------------------------------
addTable(700, 'saturnAtmosphere', [
    [Items.hydrogen.id, .96],
    [Items.helium.id, .03],
    [Items.methane.id, 0.01]
]);

// ---------------------------------------------------------------------------
// Neptune resources
// ---------------------------------------------------------------------------
addTable(800, 'neptuneAtmosphere', [
    [Items.hydrogen.id, .080],
    [Items.helium.id, .019],
    [Items.methane.id, 0.001]
]);

// ---------------------------------------------------------------------------
// Pluto resources
// ---------------------------------------------------------------------------
addTable(900, 'plutoAtmosphere', [
    [Items.nitrogen.id, 0.090],
    [Items.methane.id, 0.005],
    [Items.carbonMonoxide.id, 0.005]
]);

// ---------------------------------------------------------------------------
// Scavenge resources
// ---------------------------------------------------------------------------

// TODO: Add items to drop when scavenging.

addTable(1000, 'earthScavengeRes', [
    [Items.aluminumRing.id, 0.01],
    [Items.armoire.id, 0.006],
    [Items.bigRock.id, 0.006],
    [Items.blender.id, 0.006],
    [Items.bluntPencil.id, 0.006],
    [Items.breadKnife.id, 0.001],
    [Items.brokenKnife.id, 0.006],
    [Items.camera.id, 0.004],
    [Items.canOpener.id, 0.0009],
    [Items.carRadio.id, 0.0009],
    [Items.carWheel.id, 0.008],
    [Items.clutch.id, 0.008],
    [Items.colander.id, 0.0009],
    [Items.computer.id, 0.009],
    [Items.depletedBattery.id, 0.001],
    [Items.diningRoomTable.id, 0.0009],
    [Items.handheldMirror.id, 0.009],
    [Items.kitchenKnife.id, 0.006],
    [Items.leatherBelt.id, 0.006],
    [Items.measuringCup.id, 0.006],
    [Items.motorOil.id, 0.009],
    [Items.oldShipPart.id, 0.00009],
    [Items.pan.id, 0.009],
    [Items.pizzaCutter.id, 0.009],
    [Items.silverCoin.id, 0.09],
    [Items.sparkPlugs.id, 0.009],
    [Items.spatula.id, 0.009],
    [Items.tableLeg.id, 0.009],
    [Items.teaKettle.id, 0.009],
    [Items.telescope.id, 0.009],
    [Items.television.id, 0.009],
    [Items.tinyStone.id, 0.09],
    [Items.tire.id, 0.009],
    [Items.urinal.id, 0.0009],
    [Items.waterBackpack.id, 0.009],
    [Items.waterBottle.id, 0.09],
    [Items.webcam.id, 0.0009],
    [Items.woodenSpoon.id, 0.009]
]);

//---------------------------------------------------------------------------
//NPC loot
//---------------------------------------------------------------------------
addTable(1500, 'npcGenericLoot', [
    [Items.copperBar.id, 0.5]
]);
