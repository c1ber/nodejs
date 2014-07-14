var kommand=require('../lib/kommand').instance;
var config = require('./config');
var path=require('path');
var exec = require('child_process').exec;

kommand.run(config.port, config.ip);

kommand.on('data',function(data){
	console.log(data);
	process_cmd(data);
	exec('cscript "'+path.resolve('../bin/speak.vbs')+'" "'+data+'"');
});

function process_cmd(cmd){
	cmd=cmd.toLowerCase();
	if(cmd.indexOf('search')>=0)
		cmd_exec('start /max http://www.google.com/search?q="'+cmd.replace('search','').trim().replace(/ /g, '+')+'"');

	if(cmd.indexOf('open')>=0)
		cmd_exec('start /max http://'+cmd.replace('open','').trim());
		
	if(cmd.indexOf('run')>=0)
		cmd_exec('start '+cmd.replace('run','').replace(/^\s\s*/, '').replace(/\s\s*$/, ''));

	if(cmd.indexOf('shutdown')>=0 && cmd.indexOf('computer')>=0)
		cmd_exec('shutdown -p');

	if(cmd.indexOf('restart')>=0 && cmd.indexOf('computer')>=0)
		cmd_exec('shutdown -r -f -t 0');	
		
	if(cmd.indexOf('logoff')>=0 || cmd.indexOf('log off')>=0 && cmd.indexOf('computer')>=0)
		cmd_exec('shutdown -l');
		
	if(cmd.indexOf('lock')>=0 && cmd.indexOf('computer')>=0 && cmd.indexOf('unlock')<0)
		cmd_exec('rundll32.exe user32.dll,LockWorkStation');
		
	if(cmd.indexOf('unlock')>=0 && cmd.indexOf('computer')>=0)
		setTimeout(function(){cmd_exec('cscript speak.vbs "Please enter your password."');},2000);	
}

function cmd_exec(cmd, cb_stdout, cb_end) {
    child = exec(cmd);
}

if (!String.prototype.trim) {
 String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g,'');
 }
}