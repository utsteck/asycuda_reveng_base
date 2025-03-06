#!/usr/bin/env node
// import {server} from "websocket";
import { server as WebSocketServer } from "websocket";
import {createServer} from 'http';
import { config } from "./config";
import { ConnectionHandlers } from "./handlers/main";


var server = createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(config.port, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

const wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin:string) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    // var connection = request.accept('echo-protocol', request.origin);
    const connectionHandlers= new ConnectionHandlers(request.accept('echo-protocol', request.origin))
    
    console.log((new Date()) + ' Connection accepted.');
    
});