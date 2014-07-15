// ---------------------------------------------------------------------------
// General system variables and data
// ---------------------------------------------------------------------------
var sys = new System();

// Temp hack to define exports if we are including the scripts outside of build environment
if(!exports) {
	var exports = {};
}

exports.sys = sys;

function System() {	
    this.imageRoot = "assets/images/";
    this.iconRoot = this.imageRoot + "itemIcons/";
    this.gemIconRoot = this.iconRoot + "gems/";
    
    this.enableDragDrop = false; // too buggy right now to leave this enabled
    this.dragDelay = 300; // delay before starting to drag
    
    this.floatFadeDelay = 300; // delay for floating windows to fade on close 
    
    // Selection control
    this.selectionArrowBack = this.imageRoot + 'selectionArrowBack.png';
    this.selectionArrowBackFast = this.imageRoot + 'selectionArrowBackFast.png';
    this.selectionArrowForward = this.imageRoot + 'selectionArrowForward.png';
    this.selectionArrowForwardFast = this.imageRoot + 'selectionArrowForwardFast.png';
    
    // Icons
    this.iconPlaceholder = 'icon_placeholder.png';
    this.iconPlaceholderRawMaterial = 'icon_placeholderRawMaterial.png';
    this.iconPlaceholderGem = 'icon_placeholderGem.png';
    this.iconPlaceholderChest = 'icon_placeholderGearChest.png';
    this.iconPlaceholderHead = 'icon_placeholderGearHelmet.png';
};
