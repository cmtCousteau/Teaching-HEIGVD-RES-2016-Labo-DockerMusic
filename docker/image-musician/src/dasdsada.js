

var	piano	=	{	
		song:	'ti-ta-ti'
		activeSince: ''
};	

var	trumpet	=	{	
		song:	'pouet'
		activeSince: ''		
};	

var	flute	=	{	
		song:	'trulu'
		activeSince: ''		
};	

var	violin	=	{	
		song:	'gzi-gzi'
		activeSince: ''
};

var	drum	=	{	
		song:	'boum-boum'
		activeSince: ''
};







//	We	use	a	standard	Node.js	module	to	work	with	UDP	
var	dgram	=	require('dgram');	
//	Let's	create	a	datagram	socket.	We	will	use	it	to	send	our	UDP	datagrams		
var	s	=	dgram.createSocket(‘udp4');
//	Create	a	measure	object	and	serialize	it	to	JSON		
var	measure	=	new	Object();	
measure.timestamp	=	Date.now();	
measure.location	=	that.location;	
measure.temperature	=	that.temperature;	
var	payload	=	JSON.stringify(measure);	
									
//	Send	the	payload	via	UDP	(multicast)	
message	=	new	Buffer(payload);									
s.send(message,	0,	message.length,	protocol.PROTOCOL_PORT,	protocol.PROTOCOL_MULTICAST_ADDRESS,	
function(err,	bytes)	{	
console.log("Sending	payload:	"	+	payload	+	"	via	port	"	+	s.address().port);	
});