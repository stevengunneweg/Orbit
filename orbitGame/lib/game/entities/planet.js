ig.module (
	'game.entities.planet'
)
.requires (
	'game.entities.space-object'
)
.defines(function() {
	EntityPlanet = EntitySpaceObject.extend({
		effectRadius: 0,
		score: 0,
		
		init: function(x, y, settings) {
			this.parent(x, y, settings);

			this.maxVel.x = this.maxVel.y = 1000;

			this.img = new SImage('planet.png');
		},
		update: function() {
			this.parent();

			if (this.score == null || this.score == undefined) {
				this.score = -3;
			}
			
			this.radius = this.score + 10;
			this.sphere.radius = this.radius;
			this.effectRadius = this.radius * 10;

			this.gravity = this.radius;

			var convertedPos = ig.game.state_mgr.current.convertPosToView(this.pos, false);
			var vectorToMouse = Vector.VectorBetween(convertedPos, ig.input.mouse);
			this.vel = Vector.Multiply(vectorToMouse, 5);
			// this.vel.x += vectorToMouse.x / 20;
			// this.vel.y += vectorToMouse.y / 20;

			var universe_size = ig.game.state_mgr.current.universe_size;
			if (this.pos.x > universe_size / 2) {
				this.pos.x -= universe_size;
			} else if (this.pos.x < -(universe_size / 2)) {
				this.pos.x += universe_size;
			} else if (this.pos.y > universe_size / 2) {
				this.pos.y -= universe_size;
			} else if (this.pos.y < -(universe_size / 2)) {
				this.pos.y += universe_size;
			}
		},
		draw: function() {
			this.parent();

			var ctx = ig.system.context;
			var scale = ig.game.state_mgr.current.scale;
			var convertedPos = ig.game.state_mgr.current.convertPosToView(this.pos, false);

			// Draw field of influence
			var gradient = ctx.createRadialGradient(convertedPos.x, convertedPos.y, this.radius * scale, convertedPos.x, convertedPos.y, this.effectRadius * scale);
			gradient.addColorStop(0, 'rgba(200, 200, 200, 0.3)');
			gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
			ctx.save();
		    ctx.beginPath();
			ctx.arc(convertedPos.x, convertedPos.y, this.effectRadius * scale, 0, 2 * Math.PI, false);
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'white';
			ctx.stroke();
			ctx.fillStyle = gradient;
			ctx.fill();
			ctx.restore();

			// Draw planet image
			this.img.draw(ctx, convertedPos.x - this.radius * scale, convertedPos.y - this.radius * scale, this.radius * scale * 2, this.radius * scale * 2);
		}
	});
});