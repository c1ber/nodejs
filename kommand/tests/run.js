var kommand=require('../lib/kommand').instance;
var config = require('./config');
var path=require('path');

kommand.run(config.port, config.ip);

kommand.on('data',function(data){
	console.log(data);
	require('child_process').exec('cscript "'+path.resolve('../bin/speak.vbs')+'" "'+data+'"');
});