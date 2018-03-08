var dgram = require('dgram');
var ProtoBuf = require("protobufjs");
var PORT = 33333;
var HOST = '127.0.0.1';

ProtoBuf.load("./protos/socket.proto", function(err, root) {
    if (err)
        throw err;

    // Obtain a message type
    var SocketMessage = root.lookupType("cover.Socket");

    // Exemplary payload
    var payload = { requestField: "hey baby!" };

    // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
    var errMsg = SocketMessage.verify(payload);
    if (errMsg)
        throw Error(errMsg);

    // Create a new message
    var message = SocketMessage.create(payload); // or use .fromObject if conversion is necessary

    // Encode a message to an Uint8Array (browser) or Buffer (node)
    var buffer = SocketMessage.encode(message).finish();
    // ... do something with buffer

    // Decode an Uint8Array (browser) or Buffer (node) to a message
    //var message = HelloWorldMessage.decode(buffer);
    // ... do something with message

    // If the application uses length-delimited buffers, there is also encodeDelimited and decodeDelimited.

    // Maybe convert the message back to a plain object
    // var object = HelloWorldMessage.toObject(message, {
    //     longs: String,
    //     enums: String,
    //     bytes: String,
    //     // see ConversionOptions
    // });

    var socket = dgram.createSocket({
        type: 'udp4',
        fd: 8080
    }, function(err, msg) {
        if(err) {
            console.log(err);
        }
        console.log(msg);
    });
    
    socket.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
        if(err) {
            throw err;
        }
        console.log('UDP message sent to ' + HOST +':'+ PORT);
    });
    
    socket.on("message", function (msg, rinfo) {
        console.log("[UDP-CLIENT] Received message: " + SocketMessage.decode(msg).receiveField + " from " + rinfo.address + ":" + rinfo.port);
    
        socket.close();
        //udpSocket = null;
    });
    
    socket.on('close', function(){
        console.log('socket closed.');
    });
    
    socket.on('error', function(err){
        socket.close();

        console.log('socket err');
        console.log(err);
    });
});