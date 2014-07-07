ig.module (
	'game.gamestates.offline-state'
)
.requires (
	'game.gamestates.main-state'
)
.defines(function() {
	OfflineState = MainState.extend({

		init: function(x, y, settings) {
			ig.input.bind(ig.KEY.MOUSE1, 'click_l');
		},
		update: function() {
			if (ig.input.pressed('click_l')) {
				ig.game.networker.connect();
				ig.game.state_mgr.switchToState(ig.game.state_mgr.states.MENU);
			}
		},
		draw: function() {
			ig.game.font_big.draw('Offline', ig.system.width / 2, 200, ig.Font.ALIGN.CENTER);
			ig.game.font.draw('The server is offline.', ig.system.width / 2, 250, ig.Font.ALIGN.CENTER);
			ig.game.font.draw('Click to reconnect or try refreshing the page.', ig.system.width / 2, 270, ig.Font.ALIGN.CENTER);
		},
		clear: function() {
		}
	});
});