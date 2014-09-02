//GLOBALS
$(document).foundation();

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
// $('.chat .tabs-content > .content').jScrollPane(); Too buggy for now

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
			$('.front-window').remove();
		}
		$('.menu-pop-window[data-window-type="' + windowType + '"]').addClass('front-window').show();

	}
	else{
		$('.front-window').removeClass('front-window');

		var windowClone = $('.menu-pop-window.pattern').clone().appendTo('.outters').removeClass('hide pattern').addClass('front-window').draggable({ handle: '.title-bar'}).attr('data-window-type', windowType);

		var internalHeightSync = function(){
			var estimatedInnerHeight = $(windowClone).height() - $(windowClone).find('.title-bar').outerHeight() - $(windowClone).find('.pop-window-toolbar').outerHeight() - $(windowClone).find('.pop-window-footer').outerHeight();
			$(windowClone).find('.internal-section').css('height', estimatedInnerHeight).jScrollPane({contentWidth: '0px', autoReinitialise: true});
		}
		switch(windowType) {
			case 'inventory':
				$(windowClone).find('.window-title').text(windowType).css('textTransform', 'capitalize');

				$(windowClone).resizable().find('.pop-window-body').load( "examples/inventory.html", function(e){
					internalHeightSync();

					$('.game-item').each(function(e){
						$(this).draggable({ revert: "invalid", cursor: "move" });
					});	
				});
			case 'options':
				$(windowClone).find('.window-title').text(windowType).css('textTransform', 'capitalize');
				$(windowClone).resizable().find('.pop-window-body').load( "examples/options.html", internalHeightSync);
			case 'hero':
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
			default:
				$(windowClone).find('.window-title').text(windowType).css('textTransform', 'capitalize');
				$(windowClone).resizable();	
		}
		console.log(windowType);
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

$('.prompt-line').keyup(function(e){
    if(e.keyCode == 13)
    {
        $(this).trigger("chat");
    }
});

//screwing up Flask URL matching
$.ajaxSetup ({
	//cache: false,
	timeout: 1000
});
connected=false;
logged_in=true;

$('.prompt-line').bind("chat",function(e){
   $.ajax({url: "/chat/"+$('.prompt-line').val()});
});

setInterval(function() {
	if(logged_in) {
		if(connected) {
	        $.ajax({url: "/chat/poll/global"}).done(function(obj) {
				results = obj.results
				htmlOut = "";
				results.forEach(function(message) {
					// <li class="single-msg">
	// 					<span class="timestamp">[18:35]</span><span class="player-id">Remus</span><span class="message">m</span>
	// 				</li>
					htmlOut = ""
					htmlOut+='<li class="single-msg">';
					date = new Date(message.date);
					hours = date.getHours();
					minutes = date.getMinutes();
					htmlOut+='<span class="timestamp">['+hours+':'+minutes+']</span>';
					htmlOut+='<span class="player-id">'+message.name+'</span>';
					htmlOut+='<span class="message">'+message.message+'</span>';
					htmlOut+='</li>';
				})
				$(".messages.general").append(htmlOut);
				$('.chat .tabs-content > .content.active').scrollTop($('.chat .tabs-content > .content.active')[0].scrollHeight);
			}).error(function() {
				htmlOut = ""
				htmlOut+='<li class="single-msg error">';
				date = new Date();
				hours = date.getHours();
				minutes = date.getMinutes();
				htmlOut+='<span class="timestamp">['+hours+':'+minutes+']</span>';
				htmlOut+='<span class="message">Could not connect to server!</span>';
				htmlOut+='</li>';
				$(".messages.general").append(htmlOut);
				$('.chat .tabs-content > .content.active').scrollTop($('.chat .tabs-content > .content.active')[0].scrollHeight);
				connected = false;
			})
		} else {
			$.ajax({url: "/chat/join"}).done(function() {
				connected = true;
			}).error(function(jqxhr) {
				console.log(jqxhr.statusCode());
				console.log(jqxhr);
				htmlOut = ""
				htmlOut+='<li class="single-msg error">';
				date = new Date();
				hours = date.getHours();
				minutes = date.getMinutes();
				htmlOut+='<span class="timestamp">['+hours+':'+minutes+']</span>';
				htmlOut+='<span class="message">User not logged in!</span>';
				htmlOut+='</li>';
				$(".messages.general").append(htmlOut);
				$('.chat .tabs-content > .content.active').scrollTop($('.chat .tabs-content > .content.active')[0].scrollHeight);
				logged_in = false;
			});
		}
	}
}, 200);