ig.module (
	'game.entities.asteroid'
)
.requires (
	'game.entities.space-object'
)
.defines(function() {
	EntityAsteroid = EntitySpaceObject.extend(Asteroid.prototype);
});

function Asteroid() {
}
Asteroid.prototype = {
	is_in_radius: false,
	dist_to_planet: 0,
	_vel: {},
	asteroid_index: 0,
	rot: 0,

	init: function(x, y, settings) {
		if (this.parent)
			this.parent(x, y, settings);

		this.img = new SImage('asteroids.png');
		this.asteroid_index = Math.floor(Math.random() * 4);
	},
	update: function() {
		if (this.parent)
			this.parent();
	},
	draw: function() {
		if (this.parent)
			this.parent();

		var ctx = ig.system.context;
		var scale = ig.game.state_mgr.current.scale;
		var convertedPos = ig.game.state_mgr.current.convertPosToView(this.pos, true);
		var ok_radius = Math.floor(ig.game.state_mgr.current.planets[ig.game.state_mgr.current.local_planet].radius / 3);
		var diameter = this.radius * scale * 2;

		this.drawOutline(ctx, scale, convertedPos, ok_radius);
		this.drawImage(ctx, scale, convertedPos, ok_radius, diameter);
		this.drawDistance(ctx, scale, convertedPos, ok_radius, diameter);
	},
	drawOutline: function(ctx, scale, convertedPos, ok_radius) {
		ctx.save();
	    ctx.beginPath();
		ctx.arc(convertedPos.x, convertedPos.y, this.radius * scale, 0, 2 * Math.PI, false);
		ctx.lineWidth = 1;
		if (this.radius < ok_radius) {
			ctx.strokeStyle = 'cyan';
		} else {
			ctx.strokeStyle = 'red';
		}
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.restore();
	},
	drawImage: function(ctx, scale, convertedPos, ok_radius, diameter) {
		ctx.save();
		var x = convertedPos.x - this.radius * scale,
			y = convertedPos.y - this.radius * scale;
		ctx.translate(x + (diameter / 2), y + (diameter / 2));
		ctx.rotate(this.rot*Math.PI/180);
		ctx.translate(-(x + (diameter / 2)), -(y + (diameter / 2)));
		this.img.drawTile(ctx, x, y, diameter, diameter, this.asteroid_index, 20, 20);
		this.rot ++;
		ctx.restore();
	},
	drawDistance: function(ctx, scale, convertedPos, ok_radius, diameter) {
		if (this.dist_to_planet < ig.game.state_mgr.current.planets[ig.game.state_mgr.current.local_planet].effectRadius + 1000) {
			if (this.radius >= ok_radius) {
				if (ig.game.state_mgr.current.timer < ig.game.state_mgr.current.timer_limit / 2) {
					ig.game.font_red.draw("! ", convertedPos.x, convertedPos.y + (diameter / 2), ig.Font.ALIGN.CENTER);
				}
			}
			ig.game.font_small.draw(Math.round(this.dist_to_planet) + 'km', convertedPos.x, convertedPos.y + (diameter / 2), ig.Font.ALIGN.LEFT);
		}
	},
	kill: function() {
		if (this.parent)
			this.parent();
	}
}
