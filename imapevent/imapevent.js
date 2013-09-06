var Imap = require('imap');
var readline = require('readline');
var googleapis = require('googleapis');
var inspect = require('util').inspect;
var http = require('http');
var config = require('./config');

http.createServer(function (req, res) {
  var url=require('querystring').parse(req.url);
  if(typeof url['/?code']!='undefined'){
		code=url['/?code'];
	  console.log(code);
	   res.writeHead(200, {'Content-Type': 'text/html'});
	   res.end('Auth Done. You may close the browser now.');
	   this.close();
	   rl.close();
	   processCode(code);
   }
}).listen(8081);

var imap = new Imap({
  user: config.imap_user,
  password: config.imap_pass,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});


function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

var thebox;

imap.once('ready', function() {
  openInbox(function(err, box) {
	  if (err) throw err;
	  thebox=box;
	  register_mail_hook();
  });
});

function fetch_mail(callback){  
    var f = imap.seq.fetch(thebox.messages.total, {
      bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)'
    });	
    f.on('message', function(msg, seqno) {
      //console.log('Message #%d', seqno);
      msg.on('body', function(stream, info) {
        var buffer = '';
        stream.on('data', function(chunk) {
          buffer += chunk.toString('utf8');
        });
        stream.once('end', function() {
			var header=Imap.parseHeader(buffer);
			//console.log('Parsed header: %s', inspect(header));
			callback && callback(header);
        });
      });
    });
    f.once('error', function(err) {
      ;
    });
}

function register_mail_hook(){
	imap.on('mail', function(msg) {
		console.log('New Email',msg);
		fetch_mail(function(header){
			var msg;
			msg=header.from.join('-').replace(/@/g,'AT');
			msg+="'";
			msg+=header.subject.join('');
			msg+="' 0 minute";
			send_notification(msg);
		});	
	});
}

imap.once('error', function(err) {
  console.log(err);
});

imap.once('end', function() {
  console.log('Connection ended');
});

imap.connect();


var OAuth2Client = googleapis.OAuth2Client;

// Client ID and client secret are available at
// https://code.google.com/apis/console
var CLIENT_ID = '746917355584.apps.googleusercontent.com';
var CLIENT_SECRET = 'Bdis2MdbJdSCaTt-ZVg2zkT0';
var REDIRECT_URL = 'http://localhost:8081/';

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getAccessToken() {
  // generate consent page url
  var url = theoauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/calendar'
  });

	console.log('Visit this url and Perform Auth: ', url);
	var exec = require('child_process').exec;
	var s_url=url.split('?');
	exec('start iexplore "'+url+'"', function callback(error, stdout, stderr){
		// result
	});
	rl.question('Enter the Auth code here:',processCode);
}

function processCode(code) {
		console.log("Code entered!")
		// request access token
		theoauth2Client.getToken(code, function(err, tokens) {
		  // set tokens to the client
		  // TODO: tokens should be set by OAuth2 client.
		  theoauth2Client.credentials = tokens;
		  console.log("Everything set!");
		});
}

function delete_notification(eventId){	
	console.log("Delete Event",eventId);
	theclient.calendar.events.delete({
		calendarId: 'primary',
		eventId: eventId
	})
	.withAuthClient(theoauth2Client)
	.execute(function (err, response) {
		err && console.log(err);
	});
}

function send_notification(msg) {
	theclient.calendar.events.quickAdd({
		calendarId: 'primary',
		text: msg+" 0 minute"
	})
	.withAuthClient(theoauth2Client)
	.execute(function (err, event) {
		if(event)
			setTimeout(function(){delete_notification(event.id);},300000);		
		err && console.log(err);
		//console.log(event);
		console.log("Event:"+event.id,msg);
	});
}

var theoauth2Client;
var theclient;

// load google plus v1 API resources and methods
googleapis.discover('calendar', 'v3').execute(function(err, client) {

	theclient=client;

	theoauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

	// retrieve an access token
	getAccessToken();

});