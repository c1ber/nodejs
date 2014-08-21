var net = require('net');

var tog=1;

var stdin = process.stdin;

// without this, we would only get streams once enter is pressed
stdin.setRawMode( true );

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume();

// i don't want binary, do you?
stdin.setEncoding( 'utf8' );

// on any data into stdin
stdin.on( 'data', function( key ){
  // ctrl-c ( end of text )
  if ( key === '\u0003' ) {
    process.exit();
  }
  if (key == 'a') sendkom(1);
  if (key == 's') sendkom(0);
  // write the key to stdout all normal like
  //process.stdout.write( key );
});


sendkom = function(which){
	var client = net.connect({host:'192.168.43.31',port: 6969},
	function() { //’connect’ listener
		process.stdout.write('client connected');
		tog=tog*-1;
		if(which)
			client.write('light on');
		else
			client.write('light off');	
	});
}