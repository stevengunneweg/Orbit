describe("Network", function() {
	describe("Networker", function() {
		beforeEach(function() {
			this.netw = new Networker();
			this.netw.init();
		});

		it("should exist", function() {
			expect(this.netw).not.toBe(null);
			expect(this.netw).not.toBe(undefined);
		});

		it("should be able to bind", function() {
			expect(Object.keys(this.netw.binds).length).toBe(0);
			this.netw.bindEvent('test', function(from, msg, data) {});
			expect(Object.keys(this.netw.binds).length).toBe(1);
		});

		it("should be able to unbind", function() {
			this.netw.bindEvent('test', function(from, msg, data) {});
			expect(Object.keys(this.netw.binds).length).toBe(1);
			this.netw.unbindEvent('test');
			expect(Object.keys(this.netw.binds).length).toBe(0);
		});

		// !   RTC objects not supported with Travis CI   !

		// it("should be able to create RTCPeerConnection object", function(done) {
		// 	this.netw.srtc.createConnection(0, SRTCManager.Types.DATA, function() {
		// 		done();
		// 	});
		// });

		// it("should be able to create RTCPeerConnection offer", function(done) {
		// 	this.netw.srtc.createConnection(0, SRTCManager.Types.DATA, function() {
		// 		this.netw.srtc.createOffer(0, function(offer) {
		// 			expect(offer['sdp']).not.toBeNull();
		// 			done();
		// 		}.bind(this));
		// 	}.bind(this));
		// });
	});

	describe("SocketManager", function() {
		var socket = null
		beforeEach(function() {
			socket = new SSocketManager();
		});

		it("should exist", function() {
			expect(socket).not.toBe(null);
			expect(socket).not.toBe(undefined);
		});

		it("should be able to connect", function(done) {
			socket.onDisconnect = function() {
				console.log('disconnect');
				done();
			}
			socket.connect('188.226.159.196', 8081, function(socket_id) {
				console.log('connected with id ', socket_id);
				expect(socket_id).toBeGreaterThan(0);
				done();
			});
		}.bind(this));

		it("should be able to disconnect", function(done) {
			socket.onDisconnect = function() {
				console.log('disconnect');
				done();
			}
			socket.connect('188.226.159.196', 8081, function(socket_id) {
				console.log('connected with id ', socket_id);
				expect(socket_id).toBeGreaterThan(0);
				socket.disconnect();
				done();
			});
		});
	});

	describe("RTCManager", function() {
		var rtc = null;
		beforeEach(function() {
			rtc = new SRTCManager();
		});

		it("should exist", function() {
			expect(rtc).not.toBe(null);
			expect(rtc).not.toBe(undefined);
		});

		// !   RTC objects not supported with Travis CI   !

		// it("should create connection object", function(done) {
		// 	rtc.createConnection(0, SRTCManager.Types.DATA, function() {
		// 		done();
		// 	});
		// });

		// it("shoud create offer", function(done) {
		// 	rtc.createConnection(0, SRTCManager.Types.DATA, function() {
		// 		rtc.createOffer(0, function(offer) {
		// 			expect(offer).not.toBe(null);
		// 			expect(offer).not.toBe(undefined);
		// 			done();
		// 		});
		// 	});
		// });
	});
});