ig.module (
	'game.entities.asteroid'
)
.requires (
	'game.entities.space-object'
)
.defines(function() {
	EntityAsteroid = EntitySpaceObject.extend({
		is_in_radius: false,
		dist_to_planet: 0,
		_vel: {},
		asteroid_index: 0,

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			this.img = new SImage('asteroids.png');
			this.asteroid_index = Math.floor(Math.random() * 4);
		},
		update: function() {
			this.parent();
		},
		draw: function() {
			this.parent();

			// Draw circle
			var ctx = ig.system.context;
			var scale = ig.game.state_mgr.current.scale;
			convertedPos = ig.game.state_mgr.current.convertPosToView(this.pos, true);
			var ok_radius = Math.floor(ig.game.state_mgr.current.planets[ig.game.state_mgr.current.local_planet].radius / 3);
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

			//Draw asteroid image
			ctx.save();
			var x = convertedPos.x - this.radius * scale,
				y = convertedPos.y - this.radius * scale,
				rad = this.radius * scale * 2;
			ctx.translate(x + (rad / 2), y + (rad / 2));
			ctx.rotate(this.rot*Math.PI/180);
			ctx.translate(-(x + (rad / 2)), -(y + (rad / 2)));
			this.img.drawTile(ctx, x, y, rad, rad, this.asteroid_index, 20, 20);
			this.rot ++;
			ctx.restore();

			// Draw distance text
			if (this.dist_to_planet < ig.game.state_mgr.current.planets[ig.game.state_mgr.current.local_planet].effectRadius + 1000) {
				if (this.radius >= ok_radius) {
					if (ig.game.state_mgr.current.timer < ig.game.state_mgr.current.timer_limit / 2) {
						ig.game.font_red.draw("! ", convertedPos.x, convertedPos.y + (rad / 2), ig.Font.ALIGN.CENTER);
					}
				}
				ig.game.font_small.draw(Math.round(this.dist_to_planet) + 'km', convertedPos.x, convertedPos.y + (rad / 2), ig.Font.ALIGN.LEFT);
			}
		},
		rot: 0,
		kill: function() {
			this.parent();
		}
	});
});