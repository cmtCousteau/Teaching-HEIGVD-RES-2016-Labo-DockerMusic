/*

 Author : Monzione Marco - Zharkova Anastasia
 
 Inspired from : https://hub.docker.com/r/oliechti/thermometer/


 This program listen for musician that are "playing". Every active musician
 send an UDP datagram containing his ID,soud, and when he started playing. This
 program store all active musician in a map. It listen too on a TCP port for
 telnet connexion. When a client connect to TCP, the program send in JSON format
 all the musician which are in the map.
*/

var protocol = require('./auditor-protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');


var mapObj = new Map();


// TCP server
var net = require('net');


// Start a TCP Server
net.createServer(function (client) {

	// Keep the client info.
	client.name = client.remoteAddress + ":" + client.remotePort
	
	var mapMusicianTmp = [];
	// Send in JSON format the info of all active musicians.
	mapObj.forEach(function (musician, key, mapObj) {
		
		date = new Date(musician.activeSince);
		
		var musicianInfo = {
			uuid: musician.uuid,
			instrument: musician.instrumentType,
		    activeSince: musician.activeSince
		};
		mapMusicianTmp.push(musicianInfo);
	})
	
	client.write(JSON.stringify(mapMusicianTmp));
	client.destroy();
	
}).listen(protocol.TELNET_PORT);

// Musician  constructor
var Musician = function (uuid, sound, activeSince, lastEmission) {
	this.uuid = uuid;
	this.sound = sound;
	this.activeSince = activeSince;
	this.lastEmission = lastEmission;
	
	switch(sound) {
    case "ti-ta-ti":
        this.instrumentType = "piano"
        break;
    case "pouet":
        this.instrumentType = "trumpet"
        break;
	case "trulu":
        this.instrumentType = "flute"
        break;
    case "gzi-gzi":
        this.instrumentType = "violin"
        break;
    case "boum-boum":
        this.instrumentType = "drum"
        break;		
    default:
        this.instrumentType = "unknow"
		break;
	}
}

// Check every 1000 ms if all the musician in the map are still active. If
// not remove them from the map.
function CheckMap(instrumentType) {

	CheckMap.prototype.update = function() {
		
		// Check all musician to see if they are always playing
		mapObj.forEach(function (musician, key, mapObj) {
			
			var tmp = Date.now()-musician.lastEmission;
			tmp = Math.floor(tmp/1000);
			// If the musician has not played since 5 seconds we remove it from the map.
			if(tmp > 5){
				mapObj.delete(key);
				console.log("Musician leaving : " + musician.uuid + " | " + musician.sound);
			}
			console.log(musician.uuid + " " + musician.sound + "Difference : " + tmp);
		});
	}
	// We check every 1000 ms.
	setInterval(this.update.bind(this), 1000);
}

var checkMap = new CheckMap();


// Let's create a datagram socket. listen the datagram sended by the musicians.
var s = dgram.createSocket('udp4');
s.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

// This call back is invoked when a new datagram has arrived.
s.on('message', function(msg, source) {
	
	var json = msg,
    obj = JSON.parse(json);
	
	
	if(mapObj.has(obj.uuid)){
		// If the musician is already in the map we refresh is lastEmission time.
		mapObj.get(obj.uuid).lastEmission = Date.now();// use a timeStamp to get the time in ms (only used to know if the musician is still active).
	}
	else{
		// If the musician is not already in the map we add it to the map.
		mapObj.set(obj.uuid, new Musician(obj.uuid, obj.sound, obj.activeSince, Date.now()));
		console.log("New musician : " + obj.uuid + " | " + obj.sound);
	}
	
});

