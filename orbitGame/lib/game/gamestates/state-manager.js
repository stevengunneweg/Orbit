ig.module (
	'game.gamestates.state-manager'
)
.requires (
)
.defines(function() {
	StateManager = ig.Class.extend({
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
			ig.system.stopRunLoop();
			if (this.current) {
				this.current.clear();
			}
			switch(state) {
				case this.states.MENU:
					this.current = new MenuState();
					this.state = this.states.MENU;
					break;
				case this.states.GAME:
					this.current = new GameState();
					this.state = this.states.GAME;
					break;
				case this.states.SCORE:
					this.current = new ScoreState();
					this.state = this.states.SCORE;
					break;
				case this.states.OFFLINE:
					this.current = new OfflineState();
					this.state = this.states.OFFLINE;
					break;
				case this.states.DEAD:
					this.current = new DeadState();
					this.state = this.states.DEAD;
					break;
			}
			ig.system.startRunLoop();
		}
	});
});