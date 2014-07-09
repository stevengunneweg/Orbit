describe("Game", function() {
	beforeEach(function() {
		ig.main('#canvas', MyGame, 60, document.documentElement["clientWidth"] - 200, document.documentElement["clientHeight"], 1);
	});

	it("should load the game object", function() {
		expect(ig.ready).toBe(true);
	});

	it("should create a canvas with width: window.width - 200", function() {
		expect(ig.system.width).toBe(document.documentElement["clientWidth"] - 200);
	});

	it("should create a canvas with height: window.height", function() {
		expect(ig.system.height).toBe(document.documentElement["clientHeight"]);
	});

	it("should exist", function() {
		expect(MyGame.prototype.init).not.toBeNull();
	});
});

describe("Networker", function() {
	var netw = null;
	beforeEach(function() {
		netw = new Networker();
	});

	it("should exist", function() {
		expect(netw).not.toBe(null);
		expect(netw).not.toBe(undefined);
	});

	it("should be able to bind", function() {
		expect(Object.keys(netw.binds).length).toBe(0);
		netw.bindEvent('test', function(from, msg, data) {});
		expect(Object.keys(netw.binds).length).toBe(1);
	});

	it("should be able to unbind", function() {
		netw.bindEvent('test', function(from, msg, data) {});
		expect(Object.keys(netw.binds).length).toBe(1);
		netw.unbindEvent('test');
		expect(Object.keys(netw.binds).length).toBe(0);
	});
});

describe("RTC manager", function() {
	var rtc = null
	beforeEach(function() {
		rtc = new SRTCManager();
	});

	it("should exist", function() {
		expect(rtc).not.toBe(null);
		expect(rtc).not.toBe(undefined);
	});

	it("should create connection object", function(done) {
		rtc.createConnection(0, SRTCManager.Types.DATA, function() {
			done();
		});
	});

	it("shoud create offer", function(done) {
		rtc.createConnection(0, SRTCManager.Types.DATA, function() {
			rtc.createOffer(0, function(offer) {
				expect(offer).not.toBe(null);
				expect(offer).not.toBe(undefined);
				done();
			});
		});
	});
});

describe("Socket manager", function() {
	var socket = null
	beforeEach(function() {
		socket = new SSocketManager();
	});

	it("should exist", function() {
		expect(socket).not.toBe(null);
		expect(socket).not.toBe(undefined);
	});

	// it("should be able to connect", function(done) {
	// 	socket.onDisconnect = function() {
	// 		console.log('disconnect');
	// 		done();
	// 	}
	// 	socket.connect('188.226.159.196', 8081, function(socket_id) {
	// 		expect(socket_id).toBeGreaterThan(0);
	// 		done();
	// 	});
	// });

	// it("should be able to disconnect", function(done) {
	// 	socket.connect('188.226.159.196', 8081, function(socket_id) {
	// 		expect(socket_id).toBeGreaterThan(0);
	// 		socket.disconnect();
	// 		done();
	// 	});
	// });
});

describe("Asteroid", function() {
	var asteroid = null
	beforeEach(function() {
		asteroid = new Asteroid();
	});

	it("should exist", function() {
		expect(asteroid).not.toBe(null);
		expect(asteroid).not.toBe(undefined);
	});

	it("should init", function() {
		asteroid.init(50, 50, null);

		expect(asteroid.img).not.toBeNull();
		expect(asteroid.asteroid_index).toBeGreaterThan(-1);
		expect(asteroid.asteroid_index).toBeLessThan(4);
	});
});

describe("Bounding Sphere", function() {
	var sphere = null
	beforeEach(function() {
		sphere = new BoundingSphere();
	});

	it("should exist", function() {
		expect(sphere).not.toBe(null);
		expect(sphere).not.toBe(undefined);
	});
});

describe("Planet", function() {
	var planet = null
	beforeEach(function() {
		planet = new Planet();
	});

	it("should exist", function() {
		expect(planet).not.toBe(null);
		expect(planet).not.toBe(undefined);
	});

	it("should init", function() {
		planet.init(50, 50, null);

		expect(planet.img).not.toBeNull();
		expect(planet.maxVel.x).toBeGreaterThan(500);
		expect(planet.maxVel.y).toBeGreaterThan(500);
	});
});
