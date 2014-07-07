/*
WebRTC implementation by Steven Gunneweg
*/
SRTCManager.Types = {
	DATA: 0,
	MEDIA: 1
};
function SRTCManager() {
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	window.URL = window.URL || window.webkitURL;
	window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
	window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
	window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
	var peerConnections = {},
		dataChannels = {},
		timeouts = {},
		timeoutTime = 1000,
		pc_config = pc_config = {
			"iceServers":
			[
				{ 'url': 'stun:stun01.sipphone.com' },
				{ 'url': 'stun:stun.ekiga.net' },
				{ 'url': 'stun:stun.fwdnet.net' },
				{ 'url': 'stun:stun.ideasip.com' },
				{ 'url': 'stun:stun.iptel.org' },
				{ 'url': 'stun:stun.rixtelecom.se' },
				{ 'url': 'stun:stun.schlund.de' },
				{ 'url': 'stun:stun.l.google.com:19302' },
				{ 'url': 'stun:stun1.l.google.com:19302' },
				{ 'url': 'stun:stun2.l.google.com:19302' },
				{ 'url': 'stun:stun3.l.google.com:19302' },
				{ 'url': 'stun:stun4.l.google.com:19302' },
				{ 'url': 'stun:stunserver.org' },
				{ 'url': 'stun:stun.softjoys.com' },
				{ 'url': 'stun:stun.voiparound.com' },
				{ 'url': 'stun:stun.voipbuster.com' },
				{ 'url': 'stun:stun.voipstunt.com' },
				{ 'url': 'stun:stun.voxgratia.org' },
				{ 'url': 'stun:stun.xten.com' },
				{
					'url': 'turn:numb.viagenie.ca',
					'credential': 'muazkh',
					'username': 'webrtc@live.com'
				},
				{
					'url': 'turn:192.158.29.39:3478?transport=udp',
					'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
					'username': '28224511:1379330808'
				},
				{
					'url': 'turn:192.158.29.39:3478?transport=tcp',
					'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
					'username': '28224511:1379330808'
				}
			]
		},
		local_stream = null;

	this.onReceiveData = null; //from, msg, data
	this.onIceCandidate = null; //id, candidate
	this.onDisconnect = null; //id
	this.init = function() {
	}
	this.requestMedia = function(use_video, use_audio, callback) {
		if (navigator.getUserMedia) {
			navigator.getUserMedia(
				{ video: use_video, audio: use_audio },
				onSuccess,
				onErrors
			);
			function onSuccess(stream) {
				console.log("Media caption was succesfull")
				local_stream = stream;
				if (callback)
					callback(stream);
			}
			function onErrors(e) {
				if (e.name == "PermissionDeniedError") {
					console.log("Media might already be in use");
				} else {
					console.log("error: ", e);
				}
			}
		} else {
			console.log("User media is not supported.");
		}
	}
	this.addStreamToElement = function(stream, element) {
		element.src = window.URL.createObjectURL(stream);
		element.play();
	}
	this.makeId = function() {
		return Math.round(Math.random() * (Math.pow(2, 31))) + 1;
	}
	this.createConnection = function(id, intent, succes) {
		if (window.RTCPeerConnection) {
			try {
				peerConnections[id] = new window.RTCPeerConnection(pc_config);
				// timeouts[id] = setTimeout(function() {
				// 	ig.game.networker.srtc.disconnect(id);
				// }, timeoutTime);
				
				peerConnections[id].intent = intent;
				switch(intent) {
					case SRTCManager.Types.DATA:
						attachDataTo(id);
						break;
					case SRTCManager.Types.MEDIA:
						attachMediaTo(id);
						break;
					default:
						attachDataTo(id);
				}
				
				peerConnections[id].onicecandidate = function(evt) {
					if (evt.candidate) {
						if (this.onIceCandidate) {
							this.onIceCandidate(id, evt.candidate);
						}
					}
				}.bind(this);
				if (succes) {
					succes();
				}
			} catch (e) {
				console.log("Failed to create PeerConnection, exception: ", e.message);
			}
		} else {
			console.log("RTCPeerConnection is not supported.");
		}
	}
	this.createOffer = function(id, succes) {
		console.log('Connecting with ' + id + '...');
		peerConnections[id].createOffer(
			function(offer) { //Succes
				// console.log('created offer');
				peerConnections[id].setLocalDescription(new window.RTCSessionDescription(offer));
				succes(offer);
			},
			function(e) { //Fail
				console.error("offer not created");
			},
			{}
		);
	}
	this.createAnswerToOffer = function(id, offer, succes) {
		console.log('Connecting with ' + id + '...');
		peerConnections[id].setRemoteDescription(new window.RTCSessionDescription(offer));
		// console.log('received offer');
		peerConnections[id].createAnswer(
			function(answer) { //Succes
				// console.log('created answer');
				peerConnections[id].setLocalDescription(answer);
				if (succes)
					succes(answer);
			},
			function(e) { //Fail
				console.log("answer not created");
			},
			{}
		);
	}
	this.setAnswer = function(id, answer) {
		peerConnections[id].setRemoteDescription(new window.RTCSessionDescription(answer));
		// console.log('received answer');
	}
	this.setIceCandidate = function(id, candidate) {
		// var socketGottenIce = function(sender, id, ice_data) {
		var iceCandidate = new window.RTCIceCandidate(candidate);
		peerConnections[id].addIceCandidate(iceCandidate);
	}
	this.broadcastData = function(msg, data) {
		for (var id in dataChannels) {
			this.sendDataToPeer(id, msg, data);
		}
	}
	this.sendDataToPeers = function(peer_ids, msg, data) {
		for (var id in peer_ids) {
			this.sendDataToPeer(id, msg, data);
		}
	}
	this.sendDataToPeer = function(peer_id, msg, data) {
		var pkg = JSON.stringify({ id: ig.game.socket_id, msg: msg, data: data });
		if (dataChannels[peer_id] && dataChannels[peer_id].readyState == 'open')
			try {
				dataChannels[peer_id].send(pkg);
			} catch (e) {

			}
	}
	this.disconnect = function() {
		this.broadcastData('s_peer_disconnect', null);

		for (var id in dataChannels) {
			delete dataChannels[id];
		}
		for (var id in peerConnections) {
			peerConnections[id].close();
			delete peerConnections[id];
		}
	}
	this.disconnected = function(id) {
		delete dataChannels[id];
		if (peerConnections[id]) {
			peerConnections[id].close();
			delete peerConnections[id];
		}

		if (this.onDisconnect)
			this.onDisconnect(id);
	}
	this.ping = function() {
		this.broadcastData('s_rtcping', Date.now());
	}
	this.pong = function(to, data) {
		this.sendDataToPeer(to, 's_rtcpong', data);
	}

	var attachMediaTo = function(id) {
		if (local_stream) {
			peerConnections[id].addStream(local_stream);
			console.log('attached media');
		} else {
			console.log('stream is empty');
		}
	}
	var attachDataTo = function(id) {
		// console.log('attached data');
		var dataChannel = peerConnections[id].createDataChannel("datachannel_" + id, { reliable: false });

		dataChannel.onopen = dataOnOpen;
		dataChannel.onmessage = dataOnMessage;
		dataChannel.onclose = dataOnClose;
		dataChannel.onerror = dataOnError;

		peerConnections[id].ondatachannel = function(e) {
			e.channel.onopen = dataOnOpen;
			e.channel.onmessage = dataOnMessage;
			e.channel.onclose = dataOnClose;
			e.channel.onerror = dataOnError;
		};
		var dataOnOpen = function() {
			dataChannels[id] = dataChannel;
			dataChannel.send(JSON.stringify({ msg: 's_peer_succes', data: true }));
			console.log('connected to ' + id);
		}
		var dataOnMessage = function(event) {
			receivedData(event.data);
		}
		var dataOnClose = function() {
			console.log("The Data Channel is Closed");
		}
		var dataOnError = function(error) {
			console.log("Data Channel Error:", error);
		}
	}
	var receivedRequest = function() {
		console.log('received request');
	}
	var receivedIceCandidate = function() {
		console.log('received ice');
	}
	var receivedDisconnect = function() {
		
	}
	var receivedData = function(remote_data) {
		var parsed_data = JSON.parse(remote_data);

		// console.log('reset timer')
		clearTimeout(timeouts[parsed_data.id]);
		timeouts[parsed_data.id] = setTimeout(function() {
			// ig.game.networker.srtc.disconnect(parsed_data.id);
		}, timeoutTime);

		switch(parsed_data.msg) {
			case 's_peer_disconnect':
				this.disconnected(parsed_data.id);
				break;
			case 's_rtcping':
				this.pong(parsed_data.id, parsed_data.data);
				break;
		}
		if (ig.game.networker.srtc.onReceiveData) {
			ig.game.networker.srtc.onReceiveData(parsed_data.id, parsed_data.msg, parsed_data.data);
		}
	}.bind(this);
}


/*
Websocket signaller implementation by Steven Gunneweg
Socket server sends 'server_data'
client sends 'client_data'
*/
function SSocketManager() {
	var connectTimeout = null;
	var socket = null,
		connectedToIO = false;
	this.onReceiveData = null; //from, msg, data
	this.onDisconnect = null; //

	this.init = function() {
	}
	this.connect = function(ip, port, succes) {
		if (!connectedToIO) {
			try {
				socket = io.connect('http://' + ip + ':' + port);
				connectTimeout = setTimeout(disconnected.bind(this), 1000);
				socket.on('server_data', received.bind(this));
				socket.on('disconnect', disconnected.bind(this));
				socket.on('connect', function () {
					clearTimeout(connectTimeout);
					connectedToIO = true;
					socket.emit('connect');
					if (succes) {
						succes(socket.socket.sessionid);
					}
				});
				//TODO: handle reconnects correctly
				// socket.socket.options['max reconnection attempts'] = 0;
				// socket.socket.options['reconnection delay'] = 10000;
				socket.socket.options['reconnect'] = false;
				// console.log(socket.socket.options)
			} catch(exception) {
				console.log('could not connect to socket server: ', exception);
			}
		} else {
			console.log('allready connected');
		}
	}
	this.ping = function() {
		this.sendToClient(-2, 's_serverping', Date.now());
	}

	this.broadcast = function(msg, data) {
		this.sendToClient(0, msg, data);
	}
	this.sendToClients = function(client_ids, msg, data) {
		for (var client_id = 0; client_id < client_ids.length; client_id++) {
			this.sendToClient(client_id, msg, data);
		}
	}
	this.sendToClient = function(client_id, msg, data) {
		if (connectedToIO) {
			try {
				var pkg = JSON.stringify({
					sender: socket.socket.sessionid,
					target: client_id,
					msg: msg,
					data: data
				});
				socket.emit('client_data', pkg);
			} catch(e) {
				console.log('Socket server could not be reached');
			}
		} else {
			console.log('Not yet connected to socket server')
		}
	}
	this.disconnect = function() {
		this.broadcast('disconnect', true);
	}

	var disconnected = function() {
		if (socket.transport) {
			socket.disconnect();
		}
		socket = null;
		connectedToIO = false;
		console.log('disconnected from server');
		if (this.onDisconnect) {
			this.onDisconnect();
		}
	}
	var received = function(remote_data) {
		var parsed_data = JSON.parse(remote_data);
		if (this.onReceiveData) {
			this.onReceiveData(parsed_data.sender, parsed_data.msg, parsed_data.data);
		}
	}
}