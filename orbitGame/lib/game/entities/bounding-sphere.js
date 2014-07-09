ig.module (
	'game.entities.bounding-sphere'
)
.requires (
	'impact.entity'
)
.defines(function() {
	EntityBoundingSphere = ig.Entity.extend(BoundingSphere.prototype);
});

function BoundingSphere() {
}
BoundingSphere.prototype = {
	radius: 0,

	init: function(x, y, settings) {
		this.parent(x, y, settings);
	},
	draw: function() {
		this.parent();

		if (ig.game.debug) {
			var convertedPos = ig.game.state_mgr.current.convertPosToView(this.pos);

			var ctx = ig.system.context;
			ctx.save();
		    ctx.beginPath();
			ctx.arc(convertedPos.x, convertedPos.y, this.radius * ig.game.scale, 0, 2 * Math.PI, false);
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'red';
			ctx.stroke();

			ctx.restore();
		}
	}
}
