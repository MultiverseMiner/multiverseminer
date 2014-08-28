import message, channel, user
class ChatHandler():
    def __init__(self):
        self._channels = []
        self._connected_users = []
        self.add_channel("global")
    def get_channel(self, channel_name):
        for channel in self._channels:
            if channel.name==channel_name:
                return channel
        return False
    def add_channel(self, channel_name, admin):
        self._channels.append(channel_name, admin)
    def chat(self, channel_name, user, message):
        channel = self.get_channel(channel_name)
        if channel:
            channel.chat(message, user)
    def connect(self, username):
        user = User(username)
        # authenticate here
        user.authenticated = True
        self._connected_users.append(user)
