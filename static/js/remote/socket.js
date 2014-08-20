define(['remote/socket.io'], function(io) {
    socket = new Socket(io);
    socket.initialize();
});

function Socket(io) {
	this.url = "ws://mvws.brechtmedia.com:1337";
	this.socket = undefined;
	this.retryTimeout = 60000; // 1 minute

	this.initialize = function() {
		this.connect();
	};

	this.isConnected = function() {
		if(this.socket === undefined) {
			return false;
		}

		return this.socket.connected;
	};

	this.connect = function() {
		this.socket = io(this.url, {
			forceNew: true,
			rememberTransport: false,
			reconnectionDelay: 5000,
			reconnectionAttempts: 3
		});

		this.registerConnectionEvents();
		this.registerNotificationEvents();
	};

	this.registerNotificationEvents = function() {
		this.socket.on('notification', function(msg) {
        	noty({
	            text: msg,
	            type: "information",
	            timeout: 5000
	        });
		});
	};

	// http://socket.io/docs/client-api/#socket
	this.registerConnectionEvents = function() {
		this.socket.on('connect', function() {
			//console.log('Connected!');
		});

		this.socket.on('disconnect', function() {
			//console.log('Disconnected!');
		});

		this.socket.on('reconnect_failed', function() {
			var myThis = this;
			setTimeout(function() {
				myThis.connect();
			}, myThis.retryTimeout);
		});
	};
}