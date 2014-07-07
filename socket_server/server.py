from gevent import monkey; monkey.patch_all()
import json

from socketio import socketio_manage
from socketio.server import SocketIOServer
from socketio.namespace import BaseNamespace
from socketio.mixins import RoomsMixin, BroadcastMixin


class SendToOneMixin(object):
    def sendToOne(self, event, data, target):
        pkt = dict(type="event",
                   name=event,
                   args=data,
                   endpoint=self.ns_name)

        for sessid, socket in self.socket.server.sockets.iteritems():
            if sessid == target:
                socket.send_packet(pkt)


class OrbitSocket(BaseNamespace, RoomsMixin, BroadcastMixin, SendToOneMixin):
    def recv_disconnect(self):
        _id = self.socket.sessid
        print ('disconnect from ' + _id)

        if not (_id == self.request['admin']):
            pkg = self.make_package(self.request['admin'], "s_disconnect", _id)
            self.sendToOne('socket_data', pkg, self.request['admin'])
        else:
            print 'Admin disconnected'
            self.request['admin'] = None
            pkg = self.make_package(-2, 's_offline', _id)
            self.broadcast_event('server_data', pkg)
        # send disconnect to admin if id != admin
        # broadcast session lost to all if id == admin

        self.disconnect(silent=True)

    def on_connect(self):
        _id = self.socket.sessid
        print ('connected to ' + _id)
        if (self.request['admin']):
            pkg = self.make_package(self.request['admin'], 's_connect', _id)
            self.sendToOne('socket_data', pkg, self.request['admin'])
        else:
            pkg = self.make_package(-2, 's_offline', _id)
            self.broadcast_event('server_data', pkg)

    def on_client_data(self, data):
        parsed_data = json.loads(data)

        #Check if admin is online
        if not (self.request['admin']):
            _id = self.socket.sessid
            pkg = self.make_package(-2, 's_offline', _id)
            self.broadcast_event('server_data', pkg)

        #Check if data meets protocol
        try:
            data_string = 'from: ' + str(parsed_data['sender']) + ' to: ' + str(parsed_data['target']) + ' msg: ' + str(parsed_data['msg']) + ' data: ' + str(parsed_data['data'])
        except:
            print ('corrupted client data' + str(parsed_data))
            return

        if parsed_data['target'] == -2: #to server
            if parsed_data['msg'] == 's_serverping':
                self.sendToOne('server_data', data, parsed_data['sender'])

        elif parsed_data['target'] == -1: #to admin
            self.sendToOne('socket_data', data, self.request['admin'])

        elif parsed_data['target'] == 0: #to all
            self.broadcast_event_not_me('socket_data', data)

        else: #to target
            self.sendToOne('server_data', data, parsed_data['target'])

    def on_admin_data(self, data):
        parsed_data = json.loads(data)
        if 'admin' in self.request:
            if self.request['admin'] is None:
                self.request['admin'] = self.socket.sessid
                print ('new admin with id ' + str(self.request['admin']))
            elif not (self.request['admin'] == self.socket.sessid):
                print 'admin not allowed'
                return
        else:
            print 'nope'
            return

        #Check if data meets protocol
        try:
            data_string = 'from: admin to: ' + str(parsed_data['target']) + ' action: ' + str(parsed_data['action']) + ' data: ' + str(parsed_data['data'])
        except:
            print ('corrupted admin data' + str(parsed_data))
            return

        pkg = self.make_package(parsed_data['target'], parsed_data['action'], parsed_data['data'])

        if (parsed_data['target'] == 0):
            self.broadcast_event_not_me('server_data', pkg)
        else:
            self.sendToOne('server_data', pkg, parsed_data['target'])

    def make_package(self, target, msg, data):
        return json.dumps({
            'sender': self.socket.sessid,
            'target': target,
            'msg': msg,
            'data': data
        })

class Application(object):

    def __init__(self):
        self.buffer = []
        # Dummy request object to maintain state between Namespace
        # initialization.
        self.request = {
            'admin': None,
            'nicknames': {},
        }

    def __call__(self, environ, start_response):
        path = environ['PATH_INFO'].strip('/')

        # print environ
        if not path:
            path = 'index.html'

        if path.startswith('static/') or path.endswith('html') or path.endswith('js'):
            try:
                data = open(path).read()
            except Exception:
                print 'Open path exception'
                return not_found(start_response)

            if path.endswith(".js"):
                content_type = "text/javascript"
            elif path.endswith(".css"):
                content_type = "text/css"
            elif path.endswith(".swf"):
                content_type = "application/x-shockwave-flash"
            else:
                content_type = "text/html"

            start_response('200 OK', [('Content-Type', content_type)])
            return [data]

        if path.startswith("socket.io"):
            socketio_manage(environ, {'': OrbitSocket}, self.request)
        else:
            return not_found(start_response)


def not_found(start_response):
    start_response('404 Not Found', [])
    return ['<h1>Not Found</h1>']

if __name__ == '__main__':
    print 'Listening on port 8081 and on port 10843 (flash policy server)'
    SocketIOServer(('0.0.0.0', 8081),
        Application(),
        resource="socket.io",
        policy_server=True,
        policy_listener=('0.0.0.0', 10843)
        ).serve_forever()
