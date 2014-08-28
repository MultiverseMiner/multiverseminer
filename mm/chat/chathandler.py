from message import *
from channel import *
from user import *
class ChatHandler():
    def __init__(self):
        self._channels = []
        self._connected_users = []
        self._userlastchecked = {}
        self.add_channel("global", "jmeyer2k") # hehe... it's mine... all mine
    def get_channel(self, channel_name):
        for channel in self._channels:
            if channel.name==channel_name:
                return channel
        return False
    def get_user(self, username):
        for user in self._connected_users:
            if user.name==username:
                return user
        return False
    def add_channel(self, channel_name, admin):
        self._channels.append(Channel(channel_name, admin))
    def chat(self, username, message, channel_name="global"):
        channel = self.get_channel(channel_name)
        user = self.get_user(username)
        if channel:
            channel.chat(message, user)
    def join(self, username):
        user = User(username)
        # authenticate here
        user.authenticated = True
        self._connected_users.append(user)
    def get_new_messages(self, username, channel):
        if self.get_user(username).authenticated:
            if not username in self._userlastchecked.keys():
                thingy = self.get_channel(channel).generate_messages(datetime.datetime.min)
            else:
                thingy = self.get_channel(channel).generate_messages(self._userlastchecked[username])
            self._userlastchecked[username] = datetime.datetime.now()
        return thingy
                
    # saving and loading channels/admins??