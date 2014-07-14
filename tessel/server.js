var tessel = require('tessel'); 
var http = require('http');

setTimeout(function(){


// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello World\n");
});
server.listen(8000,"0.0.0.0");

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");
tessel.led[1].write(1);
},20000);
