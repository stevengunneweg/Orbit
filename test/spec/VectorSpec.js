describe("Vector2d", function() {
	it("should exist", function() {
		var vect = new Vector();
		expect(vect).not.toBe(null);
		expect(vect).not.toBe(undefined);
	});

	it("should init with 0 if not params", function() {
		var vect = new Vector();
		expect(vect.x).toBe(0);
		expect(vect.x).toBe(0);
	});

	it("should init with params if given", function() {
		var vect = new Vector(5, 6);
		expect(vect.x).toBe(5);
		expect(vect.y).toBe(6);
	});

	it("should add 2 vectors", function() {
		var vect1 = new Vector(1, 2);
		var vect2 = new Vector(3, 4);
		var result = Vector.Add(vect1, vect2);
		expect(result.x).toBe(4);
		expect(result.y).toBe(6);
	});

	it("should substract 2 vectors", function() {
		var vect1 = new Vector(1, 2);
		var vect2 = new Vector(3, 4);
		var result = Vector.Subtract(vect1, vect2);
		expect(result.x).toBe(-2);
		expect(result.y).toBe(-2);
	});

	it("should multiply a vector with a multiplier", function() {
		var vect1 = new Vector(1, 2);
		var result = Vector.Multiply(vect1, 2);
		expect(result.x).toBe(2);
		expect(result.y).toBe(4);
	});

	it("should devide a vector with a multiplier", function() {
		var vect1 = new Vector(1, 2);
		var result = Vector.Devide(vect1, 2);
		expect(result.x).toBe(0.5);
		expect(result.y).toBe(1);
	});

	it("should return magnitude/length of a vector", function() {
		var vect = new Vector(1, 0);
		expect(Vector.Magnitude(vect)).toBe(1);
		vect = new Vector(0, 1);
		expect(Vector.Magnitude(vect)).toBe(1);
		vect = new Vector(5, 5);
		expect(Vector.Magnitude(vect)).toBe(7.0710678118654755);
	});

	it("should return vector between 2 points", function() {
		var vect1 = new Vector(5, 5);
		var vect2 = new Vector(15, 6);
		var result = Vector.VectorBetween(vect1, vect2);
		expect(result.x).toBe(10);
		expect(result.y).toBe(1);
	});

	it("should return distance between 2 vectors", function() {
		var vect1 = new Vector(5, 5);
		var vect2 = new Vector(15, 6);
		expect(Vector.DistanceBetween(vect1, vect2)).toBe(10.04987562112089);
	});

	it("should normalisea vector", function() {
		var vect = new Vector(5, 5);
		var result = Vector.Normalize(vect);
		expect(result.x).toBe(0.7071067811865475);
		expect(result.y).toBe(0.7071067811865475);
	});

	describe("Defaults", function() {
		it("vector.Zero should return with 0, 0", function() {
			var vect = Vector.Zero();
			expect(vect.x).toBe(0);
			expect(vect.y).toBe(0);
		});
		it("vector.One should return with 1, 1", function() {
			var vect = Vector.One();
			expect(vect.x).toBe(1);
			expect(vect.y).toBe(1);
		});
		it("vector.Up should return with 0, -1", function() {
			var vect = Vector.Up();
			expect(vect.x).toBe(0);
			expect(vect.y).toBe(-1);
		});
		it("vector.Down should return with 0, 1", function() {
			var vect = Vector.Down();
			expect(vect.x).toBe(0);
			expect(vect.y).toBe(1);
		});
		it("vector.Left should return with -1, 0", function() {
			var vect = Vector.Left();
			expect(vect.x).toBe(-1);
			expect(vect.y).toBe(0);
		});
		it("vector.Right should return with 1, 0", function() {
			var vect = Vector.Right();
			expect(vect.x).toBe(1);
			expect(vect.y).toBe(0);
		});
	});
});