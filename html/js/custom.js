/*global $, document, console, window:false */

//GLOBALS
$(document).foundation({
	accordion: {
		// specify the class used for active (or open) accordion panels
		active_class: 'active',
		// allow multiple accordion panels to be active at the same time
		multi_expand: true,
		// allow accordion panels to be closed by clicking on their headers
		// setting to false only closes accordion panels when another is opened
		toggleable: true
	}
});

$.expr[':'].softEmpty = function(obj){
	return obj.innerHTML.trim().length === 0;
};

//SPECIFICS
$('.accordion').on('click', 'dd', function (event) {
	$(this).closest('.content').slideToggle('fast');

	if($(this).find('i').hasClass('fa-plus')){
		$(this).find('i').removeClass('fa-plus').addClass('fa-minus');
	}
	else{
		$(this).find('i').removeClass('fa-minus').addClass('fa-plus');
	}
});

/*Custom scrollbar for slider, allows to move it around and style the way one pleases*/
$('.chat .tabs-content > .content').jScrollPane();

/*Chat is there, just hit enter and type*/
$(window).bind('keypress', function(e) {
	if(e.keyCode || e.which == 13){
		$('input.prompt-line').focus();
	}
});

/*Pop-up with menu items*/
$(document).on('click', '.menu-pop', function(){

	var windowType = $(this).attr('data-window-type');
	console.log(windowType);

	if($('.menu-pop-window[data-window-type="' + windowType + '"]').length){

		if($('.front-window').length){
			$('.front-window').removeClass('front-window');
		}
		$('.menu-pop-window[data-window-type="' + windowType + '"]').addClass('front-window').show();

	}
	else{
		$('.front-window').removeClass('front-window');

		var windowClone = $('.menu-pop-window.pattern').clone().appendTo('.outters').removeClass('hide pattern').addClass('front-window').draggable({ handle: '.title-bar'}).attr('data-window-type', windowType);

		var internalHeightSync = function(){
			var estimatedInnerHeight = $(windowClone).height() - $(windowClone).find('.title-bar').outerHeight() - $(windowClone).find('.pop-window-toolbar').outerHeight() - $(windowClone).find('.pop-window-footer').outerHeight();
			$(windowClone).find('.internal-section').css('height', estimatedInnerHeight).jScrollPane({contentWidth: '0px', autoReinitialise: true});
		};

		if(windowType == 'inventory'){

			$(windowClone).find('.window-title').text(windowType).css('textTransform', 'capitalize');

			$(windowClone).resizable().find('.pop-window-body').load( "examples/inventory.html", function(e){
				internalHeightSync();

				$('.game-item').each(function(e){
					$(this).draggable({ revert: "invalid", cursor: "move" });
				});	

				$('.storage-socket').each(function(e){

					$(this).droppable({
						accept: '.game-item',
						activeClass: 'ui-state-hover',
						hoverClass: 'ui-state-active',
						drop: function( event, ui ) {
							if($(this).is(':softEmpty')){
								$('.ui-draggable-dragging').appendTo(this).css({
									'top':'0',
									'left':'0'
								});
							}
							else{
								// var emptySocket = $('.storage-socket:softEmpty:first');
								// $('.ui-draggable-dragging').appendTo(emptySocket).css({
								// 'top':'0',
								// 'left':'0'
								// });
								$('.ui-draggable-dragging').draggable({ revert: true });
							}
						}
					});
				});

			});
		}
		else if(windowType == 'options'){

			$(windowClone).find('.window-title').text(windowType).css('textTransform', 'capitalize');
			$(windowClone).resizable().find('.pop-window-body').load( "examples/options.html", internalHeightSync);
		}
		else if(windowType == 'hero'){

			$(windowClone).find('.window-title').text('_Rufus The Planet Destroyer 1995_');

			$(windowClone).addClass('hero').find('.pop-window-body').load( "examples/hero.html", function(){

				$('.game-item').each(function(e){
					$(this).draggable({ revert: "invalid", cursor: "move" });
				});

				$('.inventory-socket').each(function(e){

					$(this).droppable({
						accept: '[data-item-type="' + $(this).attr('id') + '"]',
						activeClass: 'ui-state-hover',
						hoverClass: 'ui-state-active',
						drop: function( event, ui ) {
							$('.ui-draggable-dragging').appendTo(this).css({
								'top':'0',
								'left':'0'
							});
						}
					});
				});

				$('.storage-socket').each(function(e){

					$(this).droppable({
						accept: '.player-item',
						activeClass: 'ui-state-hover',
						hoverClass: 'ui-state-active',
						drop: function( event, ui ) {
							if($(this).is(':softEmpty')){
								$('.ui-draggable-dragging').appendTo(this).css({
									'top':'0',
									'left':'0'
								});
							}
							else{
								var emptySocket = $('.storage-socket:softEmpty:first');
								$('.ui-draggable-dragging').appendTo(emptySocket).css({
									'top':'0',
									'left':'0'
								});
							}
						}
					});
				});
			});
		}
		else if(windowType == 'crafting'){

			$(windowClone).find('.window-title').text(windowType).css('textTransform', 'capitalize');

			$(windowClone).resizable().addClass('crafting').find('.pop-window-body').load( "examples/crafting.html", function(){
				internalHeightSync();
			});

		}

	}
});

$(document).on('resize', '.menu-pop-window', function(e){
	var currentWindow = $(e.target);

	//It's window size limiting. Don't uncomment unless you know what you are doing. It may and probably will break UI elements and lag as... badly.
	//		console.log('internal:' + $(currentWindow).find('.internal-section')[0].scrollHeight);
	//		console.log('titlebar:' + $(currentWindow).find('.title-bar').height());
	//		console.log('toolbar:' + $(currentWindow).find('.pop-window-toolbar').height());
	//		console.log('footer:' + $(currentWindow).find('.pop-window-footer').height());
	//		var estimatedOutterHeight = $(currentWindow).find('.internal-section').prop('scrollHeight') + $(currentWindow).find('.title-bar').height() + $(currentWindow).find('.pop-window-toolbar').height() + $(currentWindow).find('.pop-window-footer').height();
	//		$(currentWindow).closest('.menu-pop-window').css('max-height', estimatedOutterHeight);

	var estimatedInnerHeight = $(currentWindow).height() - $(currentWindow).find('.title-bar').outerHeight() - $(currentWindow).find('.pop-window-toolbar').outerHeight() - $(currentWindow).find('.pop-window-footer').outerHeight();
	$(currentWindow).find('.internal-section').css('height', estimatedInnerHeight);

});

$(document).on('click', '.menu-pop-window', function(e){
	$('.front-window').removeClass('front-window');
	$(e.target).closest('.menu-pop-window').addClass('front-window');
});

/*Windows closing*/
$(document).on('click', '.window-close', function(){
	$(this).closest('.menu-pop-window').remove();
});

$(document).on('click', '.global-close', function(){

	if($(this).find('i').hasClass('fa-level-up')){
		$('.menu-pop-window').hide();
		$(this).find('i').removeClass('fa-level-up').addClass('fa-level-down');
	}
	else{
		$('.menu-pop-window').not('.pattern').show();
		$(this).find('i').removeClass('fa-level-down').addClass('fa-level-up');
	}

});

/*Equpment actions*/

$(document).on('dblclick', '.player-item', function(e){
	var item = $(e.target),
		targetSlot = $(item).attr('data-item-type');

	$(item).appendTo('#'+targetSlot);

});

/*Crafting panel transformation*/

$(document).on('resize', '.crafting', function(e){
	var craftingWindow = $(e.target);
	
	/*Needs to be optimized ex. FF*/

	if($(craftingWindow).width() > 699 && $('.crafting-preview.active').length){
		$('.recipes-column').addClass('large-4').removeClass('large-12');
		$('.recipe-preview').appendTo('.crafting-preview-right');
		$('.crafting-preview-right').show().addClass('active');
		$('.crafting-preview-bottom.active').hide().removeClass('active');
		$('.crafting .recipes').show();

		$('.crafting .close-recipe').hide();
	}
	else if($('.crafting-preview.active').length && $('.crafting-preview.active').length){
		$('.recipes-column').addClass('large-12').removeClass('large-4');
		$('.recipe-preview').appendTo('.crafting-preview-bottom');
		$('.crafting-preview-bottom').show().addClass('active');

		if('.crafting-preview-right.active'){
			$('.crafting .recipes').hide();
			$('.crafting .close-recipe').show();
		}

		$('.crafting-preview-right.active').hide().removeClass('active');
	}

});

$(document).on('click', '.recipes > li', function(e){

	if($('crafting-preview.active').length){
		//TBI
	}
	else if($('.crafting').width() > 699){
		$('.recipes-column').addClass('large-4').removeClass('large-12');
		$('.recipe-preview').appendTo('.crafting-preview-right');
		$('.crafting-preview-right').show().addClass('active');
		$('.crafting .close-recipe').hide();
	}
	else{
		$('.crafting-preview-bottom').show().addClass('active');
		$('.crafting .recipes').hide();
	}

});

$(document).on('click', '.close-recipe', function(e){

	$(e.target).closest('.crafting-preview.active').hide();
	$('.crafting .recipes').show();

});

$.ajaxSetup ({
	cache: false
});
