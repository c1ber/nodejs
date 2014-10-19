var tessel = require('tessel');
var kommand = require('./kommand.js').instance;
var gpio = tessel.port['GPIO'];

/* the wifi-cc3000 library is bundled in with Tessel's firmware,
 * so there's no need for an npm install. It's similar
 * to how require('tessel') works.
 */
var config = require('./config.js');
var wifi = require('wifi-cc3000');
var network = config.wifi_network; // put in your network name here
var pass = config.wifi_password; // put in your password here, or leave blank for unsecured
var security = 'wpa2'; // other options are 'wep', 'wpa', or 'unsecured'

var started = false;

// connect to the wifi network
// check if the wifi chip is busy (currently trying to connect), if not, try to connect
function tryConnectWifi() {
	if (!wifi.isBusy()) {
		connectWifi();
	} else {
		// The cc3k is set up to automatically try to connect on boot. 
		// For the first few seconds of program bootup, you'll always 
		// see the wifi chip as being "busy"
		console.log("is busy, trying again");
		setTimeout(function() {
			tryConnect();
		}, 1000);
	}
}

function connectWifi() {
	wifi.connect({
		security: security,
		ssid: network,
		password: pass,
		timeout: 30 // in seconds
	});
}

function registerWifiEvent() {
	wifi.on('connect', function(err, data) {
		// you're connected 
		if (!started)
			startKommander();
		console.log("wifi connect emitted", err, data);
	});

	wifi.on('disconnect', function(err, data) {
		// wifi dropped, probably want to call connect() again
		console.log("wifi disconnect emitted", err, data);
	})

	wifi.on('timeout', function(err) {
		// tried to connect but couldn't, retry
		console.log("wifi timeout emitted");
		connect();
	});

	wifi.on('error', function(err) {
		// one of the following happened
		// 1. tried to disconnect while not connected
		// 2. tried to disconnect while in the middle of trying to connect
		// 3. tried to initialize a connection without first waiting for a timeout or a disconnect
		console.log("wifi error emitted", err);
	});
}

startKommander = function() {
	started = true;
	setTimeout(function() {
		kommand.run(6969, "0.0.0.0", false);
		kommand.on('data', function(cmd) {
			console.log(cmd);
			cmd = cmd.toLowerCase();

			tessel.led[1].write(1);
			setTimeout(function() {
				tessel.led[1].write(0);
			}, 500);

			var state = 1;

			if (cmd.indexOf('off') >= 0 || cmd.indexOf('of') >= 0)
				state = 0;

			if (cmd.indexOf('wind') >= 0)
				gpio.digital[2].write(state);
			else if (cmd.indexOf('light') >= 0)
				gpio.digital[3].write(state);
			else if (cmd.indexOf('all') >= 0) {
				gpio.digital[2].write(state);
				gpio.digital[3].write(state);
			}
		});
		tessel.led[0].write(1);
		setTimeout(function() {
			tessel.led[0].write(0);
		}, 2000);
	}, 2000);
}

if (wifi.isConnected())
	startKommander();

registerWifiEvent();

setTimeout(function() {
	if (!wifi.isConnected())
		tryConnectWifi();
	if (wifi.isConnected() && !started)
		startKommander();
}, 20000);