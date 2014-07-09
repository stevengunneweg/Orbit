ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',

	'game.gamestates.state-manager',
	'game.gamestates.main-state',
	'game.gamestates.menu-state',
	'game.gamestates.game-state',
	'game.gamestates.score-state',
	'game.gamestates.offline-state',
	'game.gamestates.dead-state',

	'game.entities.planet',
	'game.entities.asteroid',
	'game.entities.bounding-sphere',
	'game.entities.networker',
	'game.entities.s-image'
)
.defines(function(){

	MyGame = ig.Game.extend({
		font_big: new ig.Font('media/big_font.png'),
		font: new ig.Font('media/standard_font.png'),
		font_red: new ig.Font('media/standard_font_red.png'),
		font_small: new ig.Font('media/small_font.png'),
		
		debug: false,

		state_mgr: null,
		networker: null,
		socket_id: null,

		frame_count: 0,
		measure_time: 0,
		last_fps: 0,

		pings: {},
		pingCount: 500,
		pings_done: false,
		server_pings_done: false,
		
		init: function() {
			this.networker = new Networker();
			this.networker.connect('188.226.159.196');

			ig.input.bind(ig.KEY.C, 'controls');

			this.networker.bindEvent('s_offline', function(from, msg, data) {
				this.state_mgr.switchToState(this.state_mgr.states.OFFLINE);
			}.bind(this));

			this.networker.bindEvent('s_command_unknown', function(from, msg, data) {
				console.log('unknown command');
			}.bind(this));
			this.networker.bindEvent('s_invalid_pass', function(from, msg, data) {
				console.log('invalid password');
			}.bind(this));

			this.networker.bindEvent('s_serverping', function(from, msg, data) {
				var ping = Date.now() - data;
				this.handlePing('server', ping);

				if ('server' in this.pings) {
					if (this.pings['server'][0] < this.pingCount) {
						this.pings['server'][0]++;
						this.pings['server'][1] += ping;
					} else if (!this.server_pings_done) {
						this.server_pings_done = true;
						console.log('done with server');
					}
				} else {
					this.pings['server'] = [1, ping];
				}
			}.bind(this));
			this.networker.bindEvent('s_rtcpong', function(from, msg, data) {
				var ping = Date.now() - data;
				this.handlePing(from, ping);

				if (from in this.pings) {
					if (this.pings[from][0] < this.pingCount) {
						this.pings[from][0]++;
						this.pings[from][1] += ping;
					} else {
						var done = true
						for (key in this.pings) {
							if (this.pings[key][0] < this.pingCount) {
								done = false;
							}
						}
						if (!this.pings_done && done) {
							this.pings_done = true;
							console.log('self');
							for (key in this.pings) {
								console.log("	" + key, this.pings[key][1] / this.pings[key][0]);
							}
							this.networker.srtc.broadcastData('pingResults', this.pings);
						}
					}
				} else {
					this.pings[from] = [1, ping];
				}
			}.bind(this));
			this.networker.bindEvent('pingResults', function(from, msg, data) {
				console.log(from);
				for (key in data) {
					console.log("	" + key, data[key][1] / data[key][0]);
				}
			}.bind(this));

			this.state_mgr = new StateManager();
			this.state_mgr.switchToState(this.state_mgr.states.MENU);

			setInterval(this.ping.bind(this), 50);
		},
		update: function() {
			this.parent();

			this.state_mgr.current.update();
		},
		draw: function() {
			this.parent();

			this.state_mgr.current.draw();

			var curTime = (new Date()).getTime();
			if (!this.prevTime) this.prevTime = 0;
			var delta = curTime - this.prevTime;

			this.measure_time += delta;
			this.frame_count++;
			if (this.measure_time >= 500) {
				this.last_fps = Math.round(1000 / (this.measure_time / this.frame_count));
				this.measure_time = this.frame_count = 0;
			}
			this.prevTime = (new Date()).getTime();

			this.font_small.draw(this.last_fps + 'fps', 10, 10, ig.Font.ALIGN.LEFT);

			if (ig.input.state('controls')) {
				this.drawControlls(ig.system.context);
			}
		},
		drawControlls: function(ctx) {
			ctx.save();

			var bottom = document.documentElement["clientHeight"];
			this.font.draw('Move your planet with your mouse', 10, bottom - 90, ig.Font.ALIGN.LEFT);
			this.font.draw('Green asteroids are good', 10, bottom - 70, ig.Font.ALIGN.LEFT);
			this.font.draw('Red asteroids are bad', 10, bottom - 50, ig.Font.ALIGN.LEFT);
			this.font.draw('Click to launch asteroid inside your range', 10, bottom -30, ig.Font.ALIGN.LEFT);

			ctx.restore();
		},
		ping: function() {
			if (!this.server_pings_done)
				this.networker.pingServer();
			this.networker.pingClients();
		},
		drawLine: function(ctx, a, b) {
			ctx.moveTo(a.x, a.y);
			ctx.lineTo(b.x, b.y);
		},
		goOffline: function() {
			if (this.state_mgr.state != this.state_mgr.states.OFFLINE) {
				this.state_mgr.switchToState(this.state_mgr.states.OFFLINE);
			}
		},

		command: function(pass, mess, value) {
			if (pass && mess) {
				this.networker.sign.sendToClient(-1, mess, {
					pass: pass,
					value: value
				});
			}
		},
		handlePing: function(from, ping) {
			var pingRow = document.getElementById(from);
			if (!pingRow) {
				var row = document.getElementById('pings').insertRow(1);
				row.setAttribute('id', from);
				var cell1 = row.insertCell(0);
				var cell2 = row.insertCell(1);
				cell1.innerHTML = from;
				cell2.innerHTML = ping + 'ms';
			} else {
				pingRow.cells[1].innerHTML = ping + 'ms';
			}
		},
		removePingFromTable: function(id) {
			var elem = document.getElementById(id);
			if (elem) {
				elem.parentNode.removeChild(elem);
			}
		}
	});

	// Start the Game with 60fps, a resolution of 800x600, not scaled
	ig.main( '#canvas', MyGame, 60, document.documentElement["clientWidth"] - 200, document.documentElement["clientHeight"], 1 );
});
