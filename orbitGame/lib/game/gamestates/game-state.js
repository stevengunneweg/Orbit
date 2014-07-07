ig.module (
	'game.gamestates.game-state'
)
.requires (
	'game.gamestates.main-state'
)
.defines(function() {

	var drawGravityVector = function(ctx, asteroid, planet) {
		ctx.save();
	    ctx.beginPath();
		var convertedPos = ig.game.state_mgr.current.convertPosToView(asteroid.pos, true);
	    ctx.moveTo(convertedPos.x, convertedPos.y);
	    var between = Vector.Multiply(
	    	Vector.Normalize(
				Vector.Subtract(
					ig.game.state_mgr.current.convertPosToView(planet.pos, false),
					convertedPos
				)
			),
	    	planet.gravity
	    );
		var convertedPos2 = Vector.Add(convertedPos, Vector.Multiply(between, this.scale));
		ctx.lineTo(convertedPos2.x, convertedPos2.y);
		ctx.strokeStyle = 'blue';
		ctx.lineWidth = 1;
		ctx.stroke();

		ctx.restore();
	}
	var drawPlanetVelocity = function(ctx, planet) {
		ctx.save();
		ctx.beginPath();
		var convertedPos = ig.game.state_mgr.current.convertPosToView(planet.pos, false);
		ctx.moveTo(convertedPos.x, convertedPos.y);
		ctx.lineTo(convertedPos.x + (planet.vel.x * ig.game.state_mgr.current.scale), convertedPos.y + (planet.vel.y * ig.game.state_mgr.current.scale));
		ctx.strokeStyle = 'blue';
		ctx.lineWidth = 1;
		ctx.stroke();
		
		ctx.restore();
	}
	var drawUniverseBorders = function(ctx, size, scale) {
		var convertedPos = ig.game.state_mgr.current.convertPosToView({ x: 0, y: 0 }, false);
		ctx.save();
		ctx.beginPath();
		ctx.rect(convertedPos.x - ((size / 2) * scale), convertedPos.y - ((size / 2) * scale), size * scale, size * scale);
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 1;
		ctx.stroke();
		
		ctx.restore();
	}

	GameState = MainState.extend({
		scale: 1,
		planets: {},
		asteroids: {},
		min_zoom: 0.06,
		max_zoom: 2,
		local_planet: null,
		universe_size: 50,
		game_over: false,

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			this.local_planet = -1;
			this.planets[this.local_planet] = ig.game.spawnEntity('EntityPlanet', 0, 0, {});
			ig.input.bind(ig.KEY.MOUSE1, 'click_l');
			ig.input.bind(ig.KEY.MOUSE2, 'click_r');
			ig.input.bind(ig.KEY.MWHEEL_UP, 'scroll_up');
			ig.input.bind(ig.KEY.MWHEEL_DOWN, 'scroll_down');
			ig.input.bind(ig.KEY.ESC, 'escape');

			ig.game.networker.activate();

			ig.game.networker.bindEvent('s_init_data', this.handleInitData.bind(this));
			ig.game.networker.bindEvent('s_asteroids', this.handleUpdateData.bind(this));
			ig.game.networker.bindEvent('s_altered_asteroid', this.handleAsteroidAlteration.bind(this));
			ig.game.networker.bindEvent('s_reset_pos', this.resetPlanetPos.bind(this));
			ig.game.networker.bindEvent('s_positions', this.handlePlanetData.bind(this));
			ig.game.networker.bindEvent('s_dead', this.handleDead.bind(this));
			ig.game.networker.bindEvent('s_peer_disconnect', this.killPlanet.bind(this));
		},
		handleInitData: function(from, msg, data) {
			this.inited = true;
			ig.game.networker.unbindEvent('s_init_data');

			this.universe_size = data['universe_size'];
			this.planets[this.local_planet].pos = data['spawn_pos'];
		},
		update: function() {
			this.parent();

			this.handleZoom();

			//Focus 'camera' to show planet in center of screen
			ig.game.screen.x = this.planets[this.local_planet].pos.x - ((ig.system.width / ig.game.state_mgr.current.scale) / 2);
			ig.game.screen.y = this.planets[this.local_planet].pos.y - ((ig.system.height / ig.game.state_mgr.current.scale) / 2);

			this.applyGravityBetweenPlanets();
			this.handleAsteroids();

			ig.game.networker.sendPlanet({
				pos:this.planets[this.local_planet].pos,
				vel:this.planets[this.local_planet].vel,
				score:this.planets[this.local_planet].score
			});
		},
		draw: function() {
			this.parent();

			if (ig.game.debug) {
				var ctx = ig.system.context;
				for (var id in this.asteroids) {
					drawGravityVector(ctx, this.asteroids[id], this.planets[this.local_planet]);
				}
				drawPlanetVelocity(ctx, this.planets[this.local_planet]);
				drawUniverseBorders(ctx, this.universe_size, this.scale);	
			}

			if (this.game_over) {
				ig.game.state_mgr.switchToState(ig.game.state_mgr.states.DEAD);
			}
			if (ig.input.pressed('escape')) {
				ig.game.state_mgr.switchToState(ig.game.state_mgr.states.MENU);
			}
		},
		updateLocalPlayer: function() {
			var planet = this.planets[this.local_planet];
			this.keepPlanetInBounds(planet);
			var convertedPos = this.convertPosToView(this.pos, false);
			var vectorToMouse = Vector.VectorBetween(convertedPos, ig.input.mouse);
			planet.vel = Vector.Multiply(vectorToMouse, 5);
		},
		applyGravityBetweenPlanets: function() {
			for (var planet_id in this.planets) {
				if (planet_id == this.local_planet) {
					continue;
				}
				var distanceBetween = Vector.Magnitude(Vector.VectorBetween(this.planets[this.local_planet].pos, this.planets[planet_id].pos));
				if (distanceBetween <= this.planets[this.local_planet].effectRadius) {
					this.planets[planet_id].applyGravityTo(this.planets[this.local_planet]);
				}
			}
		},
		handleAsteroids: function() {
			for (var id in this.asteroids) {
				var distanceBetween = Vector.Magnitude(Vector.VectorBetween(this.convertPosToView(this.planets[this.local_planet].pos, false), this.convertPosToView(this.asteroids[id].pos, true)));
				distanceBetween = distanceBetween / this.scale;
				this.asteroids[id].dist_to_planet = distanceBetween;

				if (distanceBetween <= this.planets[this.local_planet].effectRadius) {
					this.asteroids[id].is_in_radius = true;

					this.planets[this.local_planet].applyGravityTo(this.asteroids[id]);
					ig.game.networker.sendAlteredAsteroid({
						id: id,
						alterated: 'pos-vel',
						alteration: {
							pos: this.asteroids[id].pos,
							vel: this.asteroids[id].vel
						}
					});
					if (distanceBetween <= Math.floor(this.planets[this.local_planet].radius + this.asteroids[id].radius)) {
						this.asteroids[id].kill();
						delete this.asteroids[id];
						ig.game.networker.sendAlteredAsteroid({
							id: id,
							alterated: 'kill',
							alteration: null
						});
					} else {
						if (ig.input.pressed('click_l')) {
							this.asteroids[id].applyForce(
								Vector.Multiply(
									Vector.Normalize(
										this.asteroids[id].vel
									),
									500
								)
							);
						}
					}
				} else if (this.asteroids[id].is_in_radius) {
					this.asteroids[id].is_in_radius = false;
					ig.game.networker.sendAlteredAsteroid({
						id: id,
						alterated: 'out-of-control',
						alteration: {
							pos: this.asteroids[id].pos,
							vel: this.asteroids[id].vel,
							time: new Date().getTime()
						}
					});
				}
			}
		},
		handleZoom: function() {
			if (ig.input.pressed('scroll_up')) {
				if (this.scale < this.max_zoom) {
					this.scale += 0.03;
				}
			} else if (ig.input.pressed('scroll_down')) {
				if (this.scale > this.min_zoom) {
					this.scale -= 0.03;
				}
			}
		},
		keepPlanetInBounds: function(planet) {
			if (planet.pos.x > this.universe_size / 2) {
				planet.pos.x -= this.universe_size;
			} else if (planet.pos.x < -(this.universe_size / 2)) {
				planet.pos.x += this.universe_size;
			} else if (planet.pos.y > this.universe_size / 2) {
				planet.pos.y -= this.universe_size;
			} else if (planet.pos.y < -(this.universe_size / 2)) {
				planet.pos.y += this.universe_size;
			}
		},
		handleInitData: function(from, msg, data) {
			ig.game.networker.unbindEvent('s_init_data');

			this.universe_size = data['universe_size'];
			this.planets[this.local_planet].pos = data['spawn_pos'];
		},
		handleUpdateData: function(from, msg, data) {
			//Create/Update asteroids
			for (var key in data['asteroids']) {
				if (!data['asteroids'][key].in_control) {
					var delta_time = ((Date.now() / 1000) - data['time']);
					if (!this.asteroids[key] && !data['asteroids'][key].in_control) {
						this.asteroids[key] = ig.game.spawnEntity('EntityAsteroid', data['asteroids'][key].pos.x + (data['asteroids'][key].vel.x * delta_time), data['asteroids'][key].pos.y + (data['asteroids'][key].vel.y * delta_time), {
							radius: data['asteroids'][key].radius,
							vel: {
								x: data['asteroids'][key].vel.x,
								y: data['asteroids'][key].vel.y
							}
						});
					} else {
						if (!this.asteroids[key].is_in_radius) {
							this.asteroids[key].pos.x = data['asteroids'][key].pos.x + (this.asteroids[key].vel.x * delta_time);
							this.asteroids[key].pos.y = data['asteroids'][key].pos.y + (this.asteroids[key].vel.y * delta_time);
							this.asteroids[key].vel = data['asteroids'][key].vel;
						}
					}
				}
			}
			//Delete asteroids that don't exist on server anymore
			for (var key in this.asteroids) {
				if (!(key in data['asteroids'])) {
					this.asteroids[key].kill();
					delete this.asteroids[key];
				}
			}
			//Set player score
			this.planets[this.local_planet]['score'] = data['scores'][ig.game.socket_id];
		},
		handleAsteroidAlteration: function(from, msg, data) {
			if (data['alterated'] == 'pos-vel') {
				this.asteroids[data['id']].pos = data['alteration']['pos'];
				this.asteroids[data['id']].vel = data['alteration']['vel'];
			}
		},
		create_timeout: false,
		handlePlanetData: function(from, msg, data) {
			var time_diff = (Date.now() - data['time']) / 1000;
			data = data['data'];
			for (var key in data) {
				if (!this.planets[key]) {
					if (!this.create_timeout) {
						this.planets[key] = ig.game.spawnEntity('EntityPlanet', data[key].pos.x + (data[key].vel.x * time_diff), data[key].pos.y + (data[key].vel.y * time_diff), { gravity: this.gravity });
						this.create_timeout = true;
					}
				} else {
					if (data[key].pos.x - this.planets[this.local_planet].pos.x > (this.universe_size / 2)) {
						data[key].pos.x -= this.universe_size;
					}
					if (data[key].pos.x - this.planets[this.local_planet].pos.x < -(this.universe_size / 2)) {
						data[key].pos.x += this.universe_size;
					}

					if (data[key].pos.y - this.planets[this.local_planet].pos.y > (this.universe_size / 2)) {
						data[key].pos.y -= this.universe_size;
					}
					if (data[key].pos.y - this.planets[this.local_planet].pos.y < -(this.universe_size / 2)) {
						data[key].pos.y += this.universe_size;
					}
					this.planets[key].pos.x = data[key].pos.x + (data[key].vel.x * time_diff);
					this.planets[key].pos.y = data[key].pos.y + (data[key].vel.y * time_diff);
					this.planets[key].vel = data[key].vel;
					this.planets[key].score = data[key].score;
				}
			}
		},
		resetPlanetPos: function(from, msg, data) {
			this.planets[this.local_planet].pos = data;
		},
		handleDead: function(from, msg, data) {
			if (data == ig.game.socket_id) {
				this.game_over = true;
			}
		},
		killPlanet: function(from, msg, data) {
			if (this.planets[data]) {
				setTimeout(function() { this.create_timeout = false }.bind(this), 20);
				ig.game.removeEntity(this.planets[data]);
				delete this.planets[data];
			}
			ig.game.removePingFromTable(data);
		},
		clear: function() {
			ig.game.networker.unbindEvent('s_asteroids');
			ig.game.networker.unbindEvent('s_altered_asteroid');
			ig.game.networker.unbindEvent('s_reset_pos');
			ig.game.networker.unbindEvent('s_positions');
			ig.game.networker.unbindEvent('s_dead');
			ig.game.networker.unbindEvent('s_peer_disconnect');

			if (ig.game.networker) {
				ig.game.networker.deactivate();
			}

			for (var id in this.planets) {
				this.planets[id].kill();
			}
			for (var id in this.asteroids) {
				this.asteroids[id].kill();
			}
		},
		convertPosToView: function(pos, is_asteroid) {
			var new_pos = new Vector(
				(pos.x - ig.game.screen.x) * this.scale,
				(pos.y - ig.game.screen.y) * this.scale
			);

			if (is_asteroid) {
				var planetPos = this.planets[this.local_planet].pos;
				var dist_x = Math.round(planetPos.x - pos.x);
				if (dist_x > ((this.universe_size / 2) + 10)) {
					new_pos.x += (this.universe_size + ((dist_x - (this.universe_size / 2)) - ((dist_x - (this.universe_size / 2)) % this.universe_size))) * this.scale;
				} else if (dist_x < -((this.universe_size / 2) + 10)) {
					new_pos.x += ((-this.universe_size) + ((dist_x + (this.universe_size / 2)) - ((dist_x + (this.universe_size / 2)) % this.universe_size))) * this.scale;
				}
				var dist_y = Math.round(planetPos.y - pos.y);
				if (dist_y > ((this.universe_size / 2) + 10)) {
					new_pos.y += (this.universe_size + ((dist_y - (this.universe_size / 2)) - ((dist_y - (this.universe_size / 2)) % this.universe_size))) * this.scale;
				} else if (dist_y < -((this.universe_size / 2) + 10)) {
					new_pos.y += ((-this.universe_size) + ((dist_y + (this.universe_size / 2)) - ((dist_y + (this.universe_size / 2)) % this.universe_size))) * this.scale;
				}
			}

			return new_pos;
		}
	});
});

