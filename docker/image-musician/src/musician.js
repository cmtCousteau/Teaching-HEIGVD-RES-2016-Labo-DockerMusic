/*
 This program simulates a "smart" thermometer, which publishes the measured temperature
 on a multicast group. Other programs can join the group and receive the measures. The
 measures are transported in json payloads with the following format:

   {"timestamp":1394656712850,"location":"kitchen","temperature":22.5}

 Usage: to start a thermometer, type the following command in a terminal
        (of course, you can run several thermometers in parallel and observe that all
        measures are transmitted via the multicast group):

   node thermometer.js location temperature variation

*/

var protocol = require('./sensor-protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/*
 * Let's create a datagram socket. We will use it to send our UDP datagrams 
 */
var s = dgram.createSocket('udp4');



var uuid = require('uuid-v4');




/*
 * Let's define a javascript class for our thermometer. The constructor accepts
 * a location, an initial temperature and the amplitude of temperature variation
 * at every iteration
 */
function Thermometer(instrumentType) {

	this.instrumentType = instrumentType;
	
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
	this.activeSince = Date.now();
	

/*
   * We will simulate temperature changes on a regular basis. That is something that
   * we implement in a class method (via the prototype)
   */
	Thermometer.prototype.update = function() {
/*
	  * Let's create the measure as a dynamic javascript object, 
	  * add the 3 properties (timestamp, location and temperature)
	  * and serialize the object to a JSON string
	  */
		var measure = {
			uuid: this.uuid,
			sound: this.sound,
			activeSince: this.activeSince
		};
		var payload = JSON.stringify(measure);

/*
	   * Finally, let's encapsulate the payload in a UDP datagram, which we publish on
	   * the multicast address. All subscribers to this address will receive the message.
	   */
		message = new Buffer(payload);
		s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
			console.log("Sending payload: " + payload + " via port " + s.address().port);
		});

	}

	/*
	 * Let's take and send a measure every 1000 ms
	 */
	setInterval(this.update.bind(this), 1000);

}

/*
 * Let's get the thermometer properties from the command line attributes
 * Some error handling wouln't hurt here...
 */
var instrumentType = process.argv[2];

//var temp = parseInt(process.argv[3]);

/*
 * Let's create a new thermoter - the regular publication of measures will
 * be initiated within the constructor
 */
var t1 = new Thermometer(instrumentType);
