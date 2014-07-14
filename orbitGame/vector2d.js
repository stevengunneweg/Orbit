function Vector(x, y) {
	this.x = x || 0;
	this.y = y || 0;
}

Vector.Zero = function() {
	return new Vector(0, 0);
}
Vector.One = function() {
  return new Vector(1, 1);
}
Vector.Up = function() {
  return new Vector(0, -1);
}
Vector.Down = function() {
  return new Vector(0, 1);
}
Vector.Left = function() {
  return new Vector(-1, 0);
}
Vector.Right = function() {
  return new Vector(1, 0);
}

Vector.Add = function(a, b) {
	return new Vector(a.x + b.x, a.y + b.y);
}
Vector.Subtract = function(a, b) {
	return new Vector(a.x - b.x, a.y - b.y);
}
Vector.Multiply = function(vector, multiplier) {
	return new Vector(vector.x * multiplier, vector.y * multiplier);
}
Vector.Devide = function(vector, multiplier) {
	return new Vector(vector.x / multiplier, vector.y / multiplier);
}
Vector.Magnitude = function(vector) {
  return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
}
Vector.VectorBetween = function(a, b) {
  return new Vector(b.x - a.x, b.y - a.y);
}
Vector.DistanceBetween = function(a, b) {
  return Vector.Magnitude(Vector.VectorBetween(a, b));
}
Vector.Normalize = function(vector) {
  return new Vector(vector.x / Vector.Magnitude(vector), vector.y / Vector.Magnitude(vector));
}
