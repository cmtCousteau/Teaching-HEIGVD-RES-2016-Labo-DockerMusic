/*
  Author : Monzione Marco - Zharkova Anastasia
 
 Inspired from : https://hub.docker.com/r/oliechti/thermometer/
 
 This program create a musician. From the received parameter it create the corresponding instrument.
 After that it send every 1000 ms a datagram with the info the musician.

*/

var protocol = require('./musician-protocol');


// We use a standard Node.js module to work with UDP
var dgram = require('dgram');


// Let's create a datagram socket. We will use it to send our UDP datagrams 
var s = dgram.createSocket('udp4');

// Used to create a GUI.
var uuid = require('uuid-v4');


// Class used to create a musician.
function Musician(instrumentType) {

	this.instrumentType = instrumentType;
	
	// Create to the instrument correspopnding to the received parameter.
	switch(instrumentType) {
    case "piano":
        this.sound = "ti-ta-ti"
        break;
    case "trumpet":
        this.sound = "pouet"
        break;
	case "flute":
        this.sound = "trulu"
        break;
    case "violin":
        this.sound = "gzi-gzi"
        break;
    case "drum":
        this.sound = "boum-boum"
        break;		
    default:
        this.sound = "unknow"
		break;
	}
	this.uuid = uuid();
	this.activeSince = new Date();

    
	Musician.prototype.update = function() {

		// Create an object with the info of the musician, serialize the info with json and send them with UDP.
		var musicianInfo = {
			uuid: this.uuid,
			sound: this.sound,
			activeSince: this.activeSince
		};
		var payload = JSON.stringify(musicianInfo);

	   // Finally, let's encapsulate the payload in a UDP datagram, which we publish on
	   // the multicast address. All subscribers to this address will receive the message.
		message = new Buffer(payload);
		s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
			console.log("Sending payload: " + payload + " via port " + s.address().port);
		});
	}

	// Send the musician info very 1000 ms.
	setInterval(this.update.bind(this), 1000);

}

// Get the instrument type from the first parameter passed to the container.
var instrumentType = process.argv[2];


// Create a new musician.
var musician = new Musician(instrumentType);
