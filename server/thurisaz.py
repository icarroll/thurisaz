#!/usr/bin/python3

#import binascii
#import json
#import pysodium
from websocket_server import *

client_info = dict(dwarf=None, troll=None, observers=[])

def new_client(client, server):
    clientid = client["id"]

    if client_info["dwarf"] is None:
        client_info["dwarf"] = client
        print("new dwarf", clientid)
        server.send_message(client, "play_dwarf");
    elif client_info["troll"] is None:
        client_info["troll"] = client
        print("new troll", clientid)
        server.send_message(client, "play_troll");
    else:
        client_info["observers"].append(client)
        print("new observer", clientid)
        server.send_message(client, "observe");

def client_left(client, server):
    if client_info["dwarf"] == client:
        client_info["dwarf"] = None
        print("dwarf left")
    elif client_info["troll"] == client:
        client_info["troll"] = None
        print("troll left")
    elif client in client_info["observers"]:
        client_info["observers"].remove(client)
        print("observer left")

def message_received(client, server, message):
    if client_info["dwarf"] == client:
        print("dwarf said", message)
        server.send_message(client_info["troll"], message)
        for observerid in client_info["observers"]:
            server.send_message(observerid, message)
    elif client_info["troll"] == client:
        print("troll said", message)
        server.send_message(client_info["dwarf"], message)
        for observerid in client_info["observers"]:
            server.send_message(observerid, message)

s = WebsocketServer(port=20821, host="0.0.0.0")
s.set_fn_new_client(new_client)
s.set_fn_client_left(client_left)
s.set_fn_message_received(message_received)

try:
    s.run_forever()
except KeyboardInterrupt:
    messageobj = dict(advise_server_quit=True)
    message = json.dumps(messageobj)
    s.send_message_to_all(message)
    print("server said", message)
