ig.module (
	'game.entities.space-object'
)
.requires (
	'impact.entity'
)
.defines(function() {
	EntitySpaceObject = ig.Entity.extend(SpaceObject.prototype);
});

function SpaceObject() {
}
SpaceObject.prototype = {
	gravity: 0,
	sphere: null,
	radius: 0,
	effectRadius: 0,
	img: null,
	maxVel: {x: 0, y: 0},

	init: function(x, y, settings) {
		if (this.parent)
			this.parent(x, y, settings);

		this.maxVel.x = this.maxVel.y = 3000;
		this.sphere = ig.game.spawnEntity('EntityBoundingSphere', x, y, {radius: settings.radius});
	
	},
	draw: function() {
		if (this.parent)
			this.parent();

		var ctx = ig.system.context;
		var scale = ig.game.state_mgr.current.scale;
		var convertedPos = ig.game.state_mgr.current.convertPosToView(this.pos,true);
		if (ig.game.debug) {

			ctx.save();
		    ctx.beginPath();
		    ctx.moveTo(convertedPos.x, convertedPos.y);
		    ctx.lineTo(convertedPos.x + (this.vel.x * scale), convertedPos.y + (this.vel.y * scale));
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'red';
			ctx.stroke();

			ctx.restore();
		}	
	},
	update: function() {
		if (this.parent)
			this.parent();

		this.sphere.pos = this.pos;

		var convertedPos = ig.game.state_mgr.current.convertPosToView(this.pos);
	},
	kill: function() {
		if (this.parent)
			this.parent();

		this.sphere.kill();
	},
	applyForce: function(force) {
		if (ig.game.debug) {
			var convertedPos = ig.game.state_mgr.current.convertPosToView(this.pos, true);

			var ctx = ig.system.context;
			ctx.save();
		    ctx.beginPath();
		    ctx.moveTo(convertedPos.x, convertedPos.y);
		    ctx.lineTo(convertedPos.x + (force.x * 500), convertedPos.y + (force.y * 500));
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'white';
			ctx.stroke();

			ctx.restore();
		}
		this.vel.x += force.x;
		this.vel.y += force.y;
	},
	applyGravityTo: function(object) {
		var magn = Vector.Magnitude(
			Vector.VectorBetween(
				ig.game.state_mgr.current.convertPosToView(this.pos, false),
				ig.game.state_mgr.current.convertPosToView(object.pos, true)
			)
		) / ig.game.state_mgr.current.scale;
		magn /= this.effectRadius;
		object.applyForce(
			Vector.Multiply(
				Vector.Normalize(
					Vector.Subtract(
						ig.game.state_mgr.current.convertPosToView(this.pos, false),
						ig.game.state_mgr.current.convertPosToView(object.pos, true)
					)
				),
				this.gravity * (1 - magn)
			)
		);
	}
}