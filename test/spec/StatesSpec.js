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