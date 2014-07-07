ig.module (
	'game.entities.networker'
)
.requires (
)
.defines(function() {
	Networker = ig.Class.extend({
		sign: null,
		srtc: null,
		binds: {},
		idToSocketId: {},

		init: function() {
			this.sign = new SSocketManager();
			this.sign.init();
			this.sign.onReceiveData = function(from, msg, data) {
				receivedData(from, msg, data);
			}.bind(this);
			this.sign.onDisconnect = function() {
				ig.game.goOffline();
			}

			this.srtc = new SRTCManager();
			this.srtc.init();
			this.srtc.onReceiveData = function(from, msg, data) {
				receivedData(from, msg, data);
			}.bind(this);
			this.srtc.onIceCandidate = function(id, candidate) {
				// console.log('sending iceCandidate...');
				this.sign.sendToClient(id, 's_peer_ice', candidate);
			}.bind(this);
			this.srtc.onDisconnect = function(id) {
				// console.log('peer ' + id + ' disconnected');
			}

			var receivedData = function(from, msg, data) {
				// console.log('from ', from, ' msg ', msg, 'data', data);
				switch(msg) {
					case 's_peer_conn_req':
						this.onRequest(data);
						break;
					case 's_peer_offer':
						this.onOffer(from, data);
						break;
					case 's_peer_answer':
						this.onAnswer(from, data);
						break;
					case 's_peer_ice':
						this.srtc.setIceCandidate(from, data);
						break;
					case 's_peer_disconnect':
						this.srtc.disconnected(data);
						break;
				}
				if (ig.game.networker.binds[msg]) {
					ig.game.networker.binds[msg](from, msg, data);
				}
			}.bind(this);
		},
		connect: function(ip) {
			this.sign.connect(ip, '8081', function(id) { //WLAN
				ig.game.socket_id = id;
				console.log('connected to server with id ', id);
			});
		},
		disconnect: function() {
			this.srtc.disconnect();
			this.sign.disconnect();
		},
		pingServer: function() {
			this.sign.ping();
		},
		pingClients: function() {
			this.srtc.ping();
		},
		requestPlayers: function() {
			this.sign.sendToClient(-1, 's_player_amount', true);
		},
		activate: function() {
			this.sign.sendToClient(-1, 's_setActive', true);
		},
		deactivate: function() {
			this.sign.sendToClient(-1, 's_setActive', false);
		},
		sendPlanet: function(data) {
			this.sign.sendToClient(-1, 's_planet', data);
			var planet_object = {};
			planet_object[ig.game.socket_id] = data;
			this.srtc.broadcastData('s_positions', { time: Date.now(), data: planet_object });
		},
		sendAlteredAsteroid: function(data) {
			this.sign.sendToClient(-1, 's_asteroid', data);
			this.srtc.broadcastData('s_altered_asteroid', data);
		},
		onRequest: function(requester) {
			this.srtc.createConnection(requester, SRTCManager.Types.DATA, function() {
				this.srtc.createOffer(requester, function(offer) {
					this.sign.sendToClient(requester, 's_peer_offer', offer);
				}.bind(this));
			}.bind(this));
		},
		onOffer: function(requester, offer) {
			this.srtc.createConnection(requester, SRTCManager.Types.DATA, function() {
				this.srtc.createAnswerToOffer(requester, offer, function(answer) {
					this.sign.sendToClient(requester, 's_peer_answer', answer);
				}.bind(this));
			}.bind(this));
		},
		onAnswer: function(id, answer) {
			this.srtc.setAnswer(id, answer);
		},
		onData: function(data) {

		},
		bindEvent: function(mess, event) {
			this.binds[mess] = event;
		},
		unbindEvent: function(mess) {
			delete this.binds[mess];
		}
	});
});