from socketIO_client import SocketIO
from random import random
import json
import math
import time

class GameServer(object):
    def __init__(self):
        self.clients = {}
        self.players = {}
        self.asteroids = {}
        self.socketIO = None
        self.peerconnections = {}
        self.conn_mgr = ConnectionMgr()
        self.conn_range = 5000
        self.disconn_diff = 500
        self.universe_size = 20000
        self.universe_half = self.universe_size / 2

        self.max_planet_size = 500
        self.planet_max_speed = 1000
        self.planet_start_size = 10
        self.size_diff_kill = 3

        self.asteroid_count = 500
        self.asteroid_max_start_velocity = 250
        self.asteroid_max_radius = 10
        self.asteroid_min_radius = 2

        self.running = False
        self.password = 'steven'
        self.deltaTime = 0
        self.lastTime = time.time()

    def on_socket_data(self, *args):
        msg = json.loads(''.join(args))
        try:
            data_string = 'from: ' + str(msg.get('sender')) + ' to: ' + str(msg.get('target')) + ' msg: ' + str(msg.get('msg')) + ' data: ' + str(msg.get('data'))
        except:
            print ('corrupted data ' + str(msg))
            return

        if (msg.get('msg') == 's_connect'):
            self.newClient(msg.get('data'))
        elif (msg.get('msg') == 's_player_amount'):
            self.sendPlayerAmount(msg.get('sender'))
        elif (msg.get('msg') == 's_setActive'):
            self.setActive(msg.get('sender'), msg.get('data'))
        elif (msg.get('msg') == 's_disconnect'):
            self.onDisconnect(msg.get('data'))
        elif (msg.get('msg') == 's_planet'):
            self.onReceivePlanet(msg.get('sender'), msg.get('data'))
        elif (msg.get('msg') == 's_asteroid'):
            self.clientAlterAsteroid(msg.get('data'), msg.get('sender'))
        elif (msg.get('msg') == 's_connectReq'):
            for key_p1 in self.clients:
                for key_p2 in self.clients:
                    if key_p1 > key_p2: #eliminates double connections or connections with self
                        print ('connecting ' + str(key_p1) + ' and ' + str(key_p2))
                        self.emit(key_p1, 's_peer_conn_req', key_p2)


        if type(msg.get('data')) is dict and (('pass' in msg.get('data')) and ('value' in msg.get('data'))):
            if (msg.get('data').get('pass') == self.password):
                if (msg.get('msg') == 'set_pass'):
                    print 'password is set to "' + str(msg.get('data').get('value')) + '"'
                    self.password = msg.get('data').get('value')
                elif (msg.get('msg') == 'restart'):
                    self.restart()
                elif (msg.get('msg') == 'stop'):
                    self.stop()
                elif (msg.get('msg') == 'kick'):
                    if (msg.get('data').get('value') in self.clients):
                        self.emit(msg.get('data').get('value'), 's_offline', None)
                        self.disconnect(msg.get('data').get('value'))
                else:
                    self.emit(msg.get('sender'), 's_command_unknown', None)
                    print 'command unknown'
            else:
                self.emit(msg.get('sender'), 's_invalid_pass', None)
                print 'invalid password'

    def connect(self):
        with SocketIO('localhost', 8081) as _socketIO:
            self.socketIO = _socketIO
            self.socketIO.on('socket_data', self.on_socket_data)
            print 'connecting'

    def init(self):
        for x in range(0, self.asteroid_count):
            self.createAsteroid()
        print ('spawned ' + str(len(self.asteroids)) + ' asteroids')
        self.emit(0, 's_connect', None)

    def stop(self):
        print 'stopping server'
        self.running = False
        self.asteroids.clear()
        self.players.clear()
        self.clients.clear()
        self.socketIO.disconnect()

    def start(self):
        print 'starting server'
        self.connect()
        self.init()
        self.running = True
        self.run()

    def restart(self):
        self.stop()

        time.sleep(2)
        self.start()

    def run(self):
        while self.running:
            self.socketIO.wait(seconds = 0.5)

            self.deltaTime = time.time() - self.lastTime
            self.lastTime = time.time()

            if len(self.players) > 0:
                for key in self.asteroids:
                    self.updateAsteroid(key)

            self.ManagePlayerConnectionsAndCollisions()
    
            self.emit(0, 's_asteroids', {
                'time': time.time(),
                'asteroids': self.asteroids,
                'scores': self.getPlayerScores(),
            })

    def ManagePlayerConnectionsAndCollisions(self):
        shouldKill = []
        # Manage when players create/close peer-to-peer connections
        #             players collide/should die
        for key_p1 in self.players:
            p1 = self.players[key_p1]
            for key_p2 in self.players:
                p2 = self.players[key_p2]
                if key_p1 > key_p2: #eliminates double connections or connections with self
                    if not (p1['pos'] == { 'x': 0, 'y': 0 }):
                        delta_y = abs(p1['pos']['y'] - p2['pos']['y'])
                        delta_x = abs(p1['pos']['x'] - p2['pos']['x'])
                        
                        if (delta_x > self.universe_half):
                            delta_x -= self.universe_size
                        delta_x = abs(delta_x)

                        if (delta_y > self.universe_half):
                            delta_y -= self.universe_size
                        delta_y = abs(delta_y)

                        # connect if not yet connected
                        if delta_x < self.conn_range and delta_y < self.conn_range:
                            if not self.conn_mgr.areConnected(key_p1, key_p2):
                                self.onEnterVacinity(key_p1, key_p2)
                        # disconnect if connected
                        elif delta_x > self.conn_range + self.disconn_diff or delta_y > self.conn_range + self.disconn_diff:
                            if self.conn_mgr.areConnected(key_p1, key_p2):
                                self.onExitVacinity(key_p1, key_p2)

                    max_dist = math.pow(p1['score'] + p2['score'] + (self.planet_start_size * 2), 2)
                    if (self.calcDistSquared(p1['pos'], p2['pos']) <= max_dist):
                        if (p1['score'] > p2['score'] + self.size_diff_kill):
                            shouldKill.append(key_p2)
                        elif (p2['score'] > p1['score'] + self.size_diff_kill):
                            shouldKill.append(key_p1)
                        else:
                            shouldKill.append(key_p1)
                            shouldKill.append(key_p2)

            if p1['score'] < -3:
                shouldKill.append(key_p1)

        for key in shouldKill:
            print ('player ' + str(key) + ' is dead')
            self.killPlanet(key)
        del shouldKill[:]

    def newClient(self, _id):
        print ('player with id ' + _id + ' connected')
        self.clients[_id] = False
    
    def onDisconnect(self, _id):
        print ('player with id ' + _id + ' disconnected')
        self.clients.pop(_id, None)
        self.players.pop(_id, None)
        self.emit(0, 's_disconnect', _id)

    def emit(self, target, action, data):
        self.socketIO.emit('admin_data', json.dumps(
            {
                'target': target,
                'action': action,
                'data': data,
            })
        )

    def sendPlayerAmount(self, _target):
        print (_target + ' requests players_count. answer: ' + str(self.activePlayers()))
        self.emit(_target, 's_player_amount', self.activePlayers())

    def setActive(self, _id, _value):
        val = ''

        self.clients[_id] = _value
        if _value:
            self.conn_mgr.newPlayer(_id)
            self.players[_id] = {
                'pos': { 'x': (random() * self.universe_size) - (self.universe_half), 'y': (random() * self.universe_size) - (self.universe_half) },
                'score': 0,
            }

            self.emit(_id, 's_init_data',{
                'universe_size': self.universe_size,
                'spawn_pos': self.players[_id]['pos'],
            })
        else:
            for key_p2 in self.players:
                self.onExitVacinity(_id, key_p2)
            self.killPlanet(_id)
            val = 'in'
        print ('player ' + str(_id) + ' is now ' + val + 'active')
    
    def onReceivePlanet(self, _id, _planet):
        if (_id in self.players):
            dist = self.calcDistSquared(self.players[_id]['pos'], _planet['pos'])
            if (dist <= math.pow(self.planet_max_speed, 2)) or (397000000 < dist < 400000000):
                self.players[_id]['pos'] = _planet['pos']
                self.players[_id]['vel'] = _planet['vel']
            else:
                print ('Player ' + str(_id) + ' tried to move too far ' + str(dist))
                self.emit(_id, 's_reset_pos', self.players[_id]['pos'])

    def onEnterVacinity(self, player, requester):
        self.conn_mgr.addConnection(player, requester)
        print ('connecting ' + str(requester) + ' and ' + str(player))
        self.emit(player, 's_peer_conn_req', requester)

    def onExitVacinity(self, player, requester):
        self.conn_mgr.removeConnection(player, requester)
        print ('disconnecting ' + str(player) + ' and ' + str(requester))
        self.emit(player, 's_peer_disconnect', requester)
        self.emit(requester, 's_peer_disconnect', player)
    
    def createAsteroid(self):
        self.asteroids[str(int(random() * 50000000))] = self.newAsteroid()
    def newAsteroid(self):
        return {
            'pos': { 'x': (random() * self.universe_size) - (self.universe_half), 'y': (random() * self.universe_size) - (self.universe_half) },
            'vel': { 'x': (random() * (self.asteroid_max_start_velocity * 2)) - self.asteroid_max_start_velocity, 'y': (random() * (self.asteroid_max_start_velocity * 2)) - self.asteroid_max_start_velocity },
            'radius': (random() * (self.asteroid_max_radius - self.asteroid_min_radius)) + self.asteroid_min_radius,
            'in_control': None,
            'just_altered': None,
        }
    def clientAlterAsteroid(self, _data, _player_id):
        if not _data['id'] in self.asteroids:
            return

        asteroid = self.asteroids[_data['id']]
        alteration = _data['alteration']
        if _data['alterated'] == 'pos-vel':
            self.alterAsteroid(asteroid, alteration, _player_id, _data['id'])
        elif _data['alterated'] == 'out-of-control':
            self.regainAsteroid(alteration, asteroid)
        elif _data['alterated'] == 'kill':
            self.killAsteroid(asteroid, _player_id)

    def alterAsteroid(self, asteroid, alteration, player_id, asteroid_id):
        player = self.players[player_id]
        player_range = math.pow((player['score'] + self.planet_start_size) + 200, 2)
        dist_squared = self.calcDistSquared(asteroid['pos'], player['pos'])
        if (dist_squared < player_range):
            asteroid['in_control'] = asteroid_id
            asteroid['pos'] = alteration['pos']
            asteroid['vel'] = alteration['vel']

    def regainAsteroid(self, alteration, asteroid):
        delta_time = ((time.time() * 1000) - alteration['time']) / 1000
        asteroid['in_control'] = None
        asteroid['pos']['x'] = alteration['pos']['x'] + (alteration['vel']['x'] * delta_time)
        asteroid['pos']['y'] = alteration['pos']['y'] + (alteration['vel']['y'] * delta_time)
        asteroid['vel'] = alteration['vel']
        asteroid['just_altered'] = time.time()

    def killAsteroid(self, asteroid, _player_id):
        dist_squared = self.calcDistSquared(asteroid['pos'], self.players[_player_id]['pos'])
        if (dist_squared <= math.pow((self.players[_player_id]['score'] + self.planet_start_size) + asteroid['radius'] + 20, 2)):
            
            area_planet = math.pi * math.pow(self.players[_player_id]['score'] + self.planet_start_size, 2)
            area_asteroid = math.pi * math.pow(asteroid['radius'], 2)
            
            if (asteroid['radius'] < math.floor((self.players[_player_id]['score'] + self.planet_start_size) / 3)):
                if (self.players[_player_id]['score'] <= self.max_planet_size):
                    new_radius = math.sqrt((area_planet + area_asteroid) / math.pi)
                    self.players[_player_id]['score'] = new_radius - self.planet_start_size
                    print ('player ' + str(_player_id) + ' gained points')
            else:
                if (area_planet - area_asteroid > 0):
                    new_radius = math.sqrt((area_planet - area_asteroid) / math.pi)
                    self.players[_player_id]['score'] = new_radius - self.planet_start_size
                    print ('player ' + str(_player_id) + ' lost points')
                else:
                    self.players[_player_id]['score'] = -5

            self.asteroids = {key: value for key, value in self.asteroids.items() if value != asteroid}
            self.createAsteroid()
        else:
            asteroid['in_control'] = None

    def updateAsteroid(self, _id):
        asteroid = self.asteroids[_id]
        if asteroid['in_control'] == None:
            if asteroid['just_altered'] == None:
                asteroid['pos']['x'] += asteroid['vel']['x'] * self.deltaTime
                asteroid['pos']['y'] += asteroid['vel']['y'] * self.deltaTime
            else:
                delta_time = time.time() - asteroid['just_altered']
                asteroid['pos']['x'] += asteroid['vel']['x'] * delta_time
                asteroid['pos']['y'] += asteroid['vel']['y'] * delta_time
                asteroid['just_altered'] = None

        self.keepInUniverse(asteroid, 'x')
        self.keepInUniverse(asteroid, 'y')

    def keepInUniverse(self, _object, _axis):
        # Keep asteroids in universe bounds
        if _object['pos'][_axis] > (self.universe_half):
            _object['pos'][_axis] = -(self.universe_half)
        elif _object['pos'][_axis] < -(self.universe_half):
            _object['pos'][_axis] = (self.universe_half)

    # Does't use math.sqrt as optimation decision
    def calcDistSquared(self, _a, _b):
        vector_x = _b['x'] - _a['x']
        vector_y = _b['y'] - _a['y']
        v_length = math.pow(vector_x, 2) + math.pow(vector_y, 2)
        return abs(v_length)

    def activePlayers(self):
        return len(self.players)

    def getPlayerScores(self):
        result = {}
        for key in self.players:
            result[key] = self.players[key]['score']
        return result

    def disconnect(self, _id):
        del self.clients[_id]
        self.killPlanet(_id)

    def killPlanet(self, _id):
        if (_id in self.players):
            del self.players[_id]

        for key in self.asteroids:
            if self.asteroids[key]['in_control'] == _id:
                self.asteroids[key]['in_control'] = None
        
        self.emit(_id, 's_dead', _id)

class ConnectionMgr(object):
    def __init__(self):
        self.connections = {}

    def newPlayer(self, _id):
        self.connections[str(_id)] = []

    def areConnected(self, a, b):
        if ((str(b) in self.connections[str(a)]) and (str(a) in self.connections[str(b)])):
            return True
        else:
            return False

    def addConnection(self, a, b):
        if not self.areConnected(a, b):
            self.connections[str(a)].append(str(b))
            self.connections[str(b)].append(str(a))
        
    def removeConnection(self, a, b):
        if self.areConnected(a, b):
            self.connections[str(a)].remove(str(b))
            self.connections[str(b)].remove(str(a))


def main():
    game_server = GameServer()
    game_server.start()
    
if __name__ == '__main__':
    main()
