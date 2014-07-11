//representation of the game
ig = function() {
	return {
		module: function() { return this; },
		requires: function() { return this; },
		defines: function() { return this; },
		game: {
			spawnEntity: function() {},
			networker: {
				unbindEvent: function() {},
				deactivate: function() {}
			},
			socket_id: 0,
			screen: {x: 0, y: 0}
		}
	}
}();