/*
 This program simulates a "data collection station", which joins a multicast
 group in order to receive measures published by thermometers (or other sensors).
 The measures are transported in json payloads with the following format:

   {"timestamp":1394656712850,"location":"kitchen","temperature":22.5}

 Usage: to start the station, use the following command in a terminal

   node station.js

*/

/*
 * We have defined the multicast address and port in a file, that can be imported both by
 * thermometer.js and station.js. The address and the port are part of our simple 
 * application-level protocol
 */
var protocol = require('./sensor-protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');


var mapObj = new Map();



// TCP server
var net = require('net');


// Start a TCP Server
net.createServer(function (client) {

	// Identify this client
	client.name = client.remoteAddress + ":" + client.remotePort 
	mapObj.forEach(function (musician, key, mapObj) {
		var measure = {
			uuid: musician.uuid,
			sound: musician.sound,
			activeSince: musician.activeSince
		};
		client.write(JSON.stringify(measure) + "\n");
	})
}).listen(2205);




// Musician  constructor
var Musician = function (uuid, sound, activeSince, lastEmission) {
	this.uuid = uuid;
	this.sound = sound;
	this.activeSince = activeSince;
	this.lastEmission = lastEmission;
}




function CheckMap(instrumentType) {

	CheckMap.prototype.update = function() {
		
		// Check all musician to see if they are always playing
		mapObj.forEach(function (musician, key, mapObj) {
			
			var tmp = Date.now()-musician.lastEmission;
			tmp = Math.floor(tmp/1000);
			// If the musician has not played since 5 seconds we remove it from the map.
			if(tmp > 5){
				mapObj.delete(key);
			}
			
			/*var newDate = new Date();
			var dateString;
			dateString = newDate.getMonth();*/

			
			console.log(musician.uuid + " " + musician.sound + "Difference : " + tmp);
		});

	}

	/*
	 * We check every 1000 ms.
	 */
	setInterval(this.update.bind(this), 1000);
}

var checkMap = new CheckMap();

/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by thermometers and containing measures
 */
var s = dgram.createSocket('udp4');
s.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

/* 
 * This call back is invoked when a new datagram has arrived.
 */
s.on('message', function(msg, source) {
	//console.log("Data has arrived: " + msg + ". Source port: " + source.port);
	
	var json = msg,
    obj = JSON.parse(json);
	
	
	if(mapObj.has(obj.uuid)){
		// If the musician is already in the map we refresh is lastEmission time.
		mapObj.get(obj.uuid).lastEmission = Date.now();
		//musician.lastEmission = Date.now();
		//console.log(mapObj.get(obj.uuid).lastEmission);
	}
	else{
		
		// If the musician is not already in the map we add it to the map.
		mapObj.set(obj.uuid, new Musician(obj.uuid, obj.sound, obj.activeSince, Date.now()));
		
		/*console.log(obj.uuid);
		console.log(obj.sound);
		console.log(obj.activeSince);*/
	}
	
});

