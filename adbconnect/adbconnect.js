// http://nodejs.org/api.html#_child_processesvar os = require('os')var sys = require('sys')var exec = require('child_process').exec;var child;adbconnect = function(ip){	var cmd="adb connect "+ip;	// executes `pwd`	child = exec(cmd, function (error, stdout, stderr) {	  if(stdout)		sys.print('stdout: ' + stdout);	  if(stderr)		sys.print('stderr: ' + stderr);	  if (error !== null) {		console.log('exec error: ' + error);	  }	});}var net = require('net');isOpen = function (port, host, callback) {    var isOpen = false;    var executed = false;    var onClose = function() {        if (executed) {return;}        exectued = true;        clearTimeout(timeoutId);        delete conn;        callback(isOpen, port, host);    };    var onOpen = function() {        isOpen = true;        conn.end();    };    var timeoutId = setTimeout(function() {conn.destroy();}, 5000);    var conn = net.createConnection(port, host, onOpen);    conn.on('close', function() {if(!executed){onClose();}});    conn.on('error', function() {conn.end();});    conn.on('connect', onOpen);}var interfaces = os.networkInterfaces();var ip='';for(i in interfaces){	if(i.indexOf('Wireless')>-1){		var interface=interfaces[i];		for(j in interface){			if(interface[j].family=='IPv4'){				ip=interface[j].address;			}		}	}}var network;if(ip){	var segment=ip.split('.');	segment.pop();	network=segment.join('.');}	network=process.argv[2]?"192.168."+process.argv[2]:network;console.log('Network',network+'.0');for(i=1;i<256;i++){	isOpen("5555",network+"."+i,function(isOpen, port, host){		if(isOpen) {console.log('Device',host);adbconnect(host);}	});}