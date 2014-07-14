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

describe("StateManager", function() {
	beforeEach(function() {
		this.mgr = new StateManager();
	});

	it("should exist", function() {
		expect(this.mgr).not.toBe(null);
		expect(this.mgr).not.toBe(undefined);
	});

	it("should have states MENU, GAME, SCORE, OFFLINE, DEAD", function() {
		expect(this.mgr.states['MENU']).not.toBe(null);
		expect(this.mgr.states['MENU']).not.toBe(undefined);
		expect(this.mgr.states['GAME']).not.toBe(null);
		expect(this.mgr.states['GAME']).not.toBe(undefined);
		expect(this.mgr.states['SCORE']).not.toBe(null);
		expect(this.mgr.states['SCORE']).not.toBe(undefined);
		expect(this.mgr.states['OFFLINE']).not.toBe(null);
		expect(this.mgr.states['OFFLINE']).not.toBe(undefined);
		expect(this.mgr.states['DEAD']).not.toBe(null);
		expect(this.mgr.states['DEAD']).not.toBe(undefined);
	});

	it("should change state", function() {
		expect(this.mgr.state).toBe(0);
		this.mgr.switchToState(this.mgr.states.GAME);
		expect(this.mgr.state).toBe(1);
		this.mgr.switchToState(this.mgr.states.SCORE);
		expect(this.mgr.state).toBe(2);
		this.mgr.switchToState(this.mgr.states.OFFLINE);
		expect(this.mgr.state).toBe(3);
		this.mgr.switchToState(this.mgr.states.DEAD);
		expect(this.mgr.state).toBe(4);
		this.mgr.switchToState(this.mgr.states.MENU);
		expect(this.mgr.state).toBe(0);
	});
});

describe("States", function() {
	describe("BaseState", function() {
		beforeEach(function() {
			this.state = new BaseState();
		});

		it("should exist", function() {
			expect(this.state).not.toBe(null);
			expect(this.state).not.toBe(undefined);
		});

		it("should have init, update, draw and clear functions", function() {
			expect(this.state.init).not.toBeNull();
			expect(typeof this.state.init).toBe("function");

			expect(this.state.update).not.toBeNull();
			expect(typeof this.state.update).toBe("function");

			expect(this.state.draw).not.toBeNull();
			expect(typeof this.state.draw).toBe("function");

			expect(this.state.clear).not.toBeNull();
			expect(typeof this.state.clear).toBe("function");
		});
	});

	describe("MenuState", function() {
		beforeEach(function() {
			this.state = new MenuState();
		});

		it("should exist", function() {
			expect(this.state).not.toBe(null);
			expect(this.state).not.toBe(undefined);
		});
	});

	describe("GameState", function() {
		beforeEach(function() {
			this.state = new GameState();
		});

		it("should exist", function() {
			expect(this.state).not.toBe(null);
			expect(this.state).not.toBe(undefined);
		});

		it("should handle dead message", function() {
			this.state.handleDead(null, null, 0);
			expect(this.state.game_over).toBe(true);
		});

		it("should convert position correctly", function() {
			this.state.scale = 1;
			this.state.local_planet = 0;
			var pos = {x: 0.5, y: 0.5};
			this.state.planets = {};
			this.state.planets[this.local_planet] = {pos: Vector.Zero()};

			expect(this.state.convertPosToView(pos).x).not.toBe(0);
			expect(this.state.convertPosToView(pos).y).not.toBe(0);
			expect(this.state.convertPosToView(pos).x).toBe(0.5);
			expect(this.state.convertPosToView(pos).y).toBe(0.5);
		});
	});

	describe("DeadState", function() {
		beforeEach(function() {
			this.state = new DeadState();
		});

		it("should exist", function() {
			expect(this.state).not.toBe(null);
			expect(this.state).not.toBe(undefined);
		});
	});

	describe("OfflineState", function() {
		beforeEach(function() {
			this.state = new OfflineState();
		});

		it("should exist", function() {
			expect(this.state).not.toBe(null);
			expect(this.state).not.toBe(undefined);
		});
	});

	describe("ScoreState", function() {
		beforeEach(function() {
			this.state = new ScoreState();
		});

		it("should exist", function() {
			expect(this.state).not.toBe(null);
			expect(this.state).not.toBe(undefined);
		});
	});
});

describe("Entities", function() {
	describe("SpaceObject", function() {
		beforeEach(function() {
			this.obj = new SpaceObject();
		});

		it("should exist", function() {
			expect(this.obj).not.toBe(null);
			expect(this.obj).not.toBe(undefined);
		});

		it("should init", function() {
			this.obj.init(0, 0, {radius: 3});
			expect(this.obj.maxVel.x).toBeGreaterThan(0);
		});
	});

	describe("BoundingSphere", function() {
		beforeEach(function() {
			this.sphere = new BoundingSphere();
		});

		it("should exist", function() {
			expect(this.sphere).not.toBe(null);
			expect(this.sphere).not.toBe(undefined);
		});
	});

	describe("Planet", function() {
		beforeEach(function() {
			this.planet = new Planet();
		});

		it("should exist", function() {
			expect(this.planet).not.toBe(null);
			expect(this.planet).not.toBe(undefined);
		});
	});

	describe("Asteroid", function() {
		beforeEach(function() {
			this.asteroid = new Asteroid();
		});

		it("should exist", function() {
			expect(this.asteroid).not.toBe(null);
			expect(this.asteroid).not.toBe(undefined);
		});
	});
});
