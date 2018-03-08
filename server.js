var PORT = 33333;
var HOST = '127.0.0.1';
var ProtoBuf = require("protobufjs");
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
 
ProtoBuf.load("./protos/socket.proto", function(err, root) {
    if (err)
        throw err;

    var SocketMessage = root.lookupType("cover.Socket");

    server.on('listening', function () {
        var address = server.address();
        console.log('UDP Server listening on ' + address.address + ":" + address.port);
    });
     
    server.on('message', function (msg, remote) {
        console.log(SocketMessage.decode(msg).requestField + ' from client!');
        
        var payload = { receiveField: "go out!" };
        var message = SocketMessage.create(payload);
        var buffer = SocketMessage.encode(message).finish();

        server.send(buffer, 0, buffer.length, remote.port, remote.address, function(err, bytes) {
            if(err) {
                throw err;
            }
            console.log('UDP message reply to ' + remote.address +':'+ remote.port);
        })
    });
     
    server.bind(PORT, HOST);
});
