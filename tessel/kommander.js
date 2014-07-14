var tessel = require('tessel'); 
var kommand=require('kommand').instance;
var gpio = tessel.port['GPIO'];

setTimeout(function(){
	kommand.run(6969,"0.0.0.0",false);

	kommand.on('data',function(data){
		console.log(data);
		data=data.toLowerCase();
		if(data=="light on"){
			tessel.led[1].write(1);
			gpio.digital[3].write(1);
		}
		else if(data=="light off"){
			tessel.led[1].write(0);
			gpio.digital[3].write(0);
		}
	});
	
	tessel.led[0].write(1);
},20000);
	

