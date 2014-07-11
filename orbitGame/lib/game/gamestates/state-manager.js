ig.module (
	'game.gamestates.state-manager'
)
.requires (
)
.defines(function() {
	StateManager = ig.Class.extend(StateManager.prototype);
});

function StateManager() {
}
StateManager.prototype = {
	states: {
		MENU: 0,
		GAME: 1,
		SCORE: 2,
		OFFLINE: 3,
		DEAD: 4
	},
	state: 0,
	current: null,

	switchToState: function(state) {
		if (this.current) {
			this.current.clear();
		}
		switch(state) {
			case this.states.MENU:
				this.current = new MenuState();
				this.state = state;
				break;
			case this.states.GAME:
				this.current = new GameState();
				this.state = state;
				break;
			case this.states.SCORE:
				this.current = new ScoreState();
				this.state = state;
				break;
			case this.states.OFFLINE:
				this.current = new OfflineState();
				this.state = state;
				break;
			case this.states.DEAD:
				this.current = new DeadState();
				this.state = state;
				break;
		}
	}
}
