var net = require("net");
var command = process.argv[2];

var trynum=0;

var sendkom = function(command){
	var client = net.connect({host:'192.168.43.31',port: 6969},
	function() {
		setTimeout(function(){
			client.write(command);	
			client.end();
		},500);
		
	});
	client.on('error', function(e) {  
		client.end();
		if(command && ++trynum<3)
			sendkom(command);
    });
}

if(command)
	sendkom(command);

