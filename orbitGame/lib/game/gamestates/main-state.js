ig.module (
	'game.gamestates.main-state'
)
.requires (
	'impact.entity'
)
.defines(function() {
	MainState = ig.Entity.extend(BaseState.prototype);
});

function BaseState() {
}
BaseState.prototype = {
	init: function(x, y, settings) {

	},
	update: function() {
		
	},
	draw: function() {

	},
	clear: function() {

	}
}
