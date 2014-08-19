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
