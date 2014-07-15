ig.module (
	'game.gamestates.menu-state'
)
.requires (
	'game.gamestates.main-state'
)
.defines(function() {
	MenuState = MainState.extend(MenuState.prototype);
});

function MenuState() {
}
MenuState.prototype = {
	playerAmount: -1,
	checkInterval: null,

	init: function(x, y, settings) {
		ig.input.bind(ig.KEY.MOUSE1, 'click_l');

		ig.game.networker.bindEvent('s_player_amount', function(from, msg, data) {
			this.playerAmount = data;
		}.bind(this));
		ig.game.networker.bindEvent('s_ping', function(from, msg, data) {
			console.log('ping: ' + (Date.now() - data));
		}.bind(this));

		setTimeout(function() {
			ig.game.networker.requestPlayers();
		}, 500);
		checkInterval = setInterval(function() {
			ig.game.networker.requestPlayers();
		}.bind(this), 5000);
	},
	update: function() {
		if (ig.input.pressed('click_l')) {
			ig.game.state_mgr.switchToState(ig.game.state_mgr.states.GAME);
		}
	},
	draw: function() {
		ig.game.font_big.draw('MENU', ig.system.width / 2, 100, ig.Font.ALIGN.CENTER);
		ig.game.font.draw('Press "C" anytime to view controlls', ig.system.width / 2, 250, ig.Font.ALIGN.CENTER);
		ig.game.font.draw('Click to continue', ig.system.width / 2, 300, ig.Font.ALIGN.CENTER);
		if (this.playerAmount >= 0) {
			ig.game.font.draw(this.playerAmount + ' players online', ig.system.width / 2, 400, ig.Font.ALIGN.CENTER);
		} else {
			ig.game.font.draw('Retrieving player list', ig.system.width / 2, 400, ig.Font.ALIGN.CENTER);
		}
	},
	clear: function() {
		clearInterval(checkInterval);
		ig.game.networker.unbindEvent('s_player_amount');
	}
}