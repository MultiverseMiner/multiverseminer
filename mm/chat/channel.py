import datetime
class Channel():
    def __init__(self, channel_name, owner):
        self.name = channel_name
        self._owner = owner
        self._admins = []
        self._moderators = []
        self._banned = []
        self.connected_users = []
        # synchronized lists
        self.messages = []
        self.messageuser = []
        self.messagetime = []
        
        self.max_length = 100
    def get_user(self, username):
        for user in self.connected_users:
            if user.name == username:
                return user
        return False
    def chat(self, message, user):
        if user in self._banned or user.authenticated == False:
            return False
        if user not in self.connected_users:
            self.connected_users.append(user)
        self.messages.append(message)
        self.messageuser.append(user)
        self.messagetime.append(datetime.datetime.now())
        if len(self.messages)>self.max_length:
            self.messages.pop(0)
            self.messageuser.pop(0)
            self.messagetime.pop(0)
        self.parse_command(message, user)
    def set_owner(self, owner, sender):
        if sender==self._owner:
            self._owner = owner
    def add_admin(self, admin, owner):
        if owner == self._owner:
            self._admins.append(admin)
    def remove_admin(self, admin, owner):
        if owner == self._owner:
            if admin in self._admins: self._admins.remove(admin)
    def add_moderator(self, moderator, admin):
        if admin in self._admins:
            self._moderators.append(moderator)
    def remove_moderator(self, moderator, admin):
        if admin in self._admins:
            if moderator in self._moderators: self._moderators.remove(moderator)
    def ban(self, user, moderator):
        if moderator in self._moderators:
            self._banned.append(user)
    def pardon(self, user, moderator):
        if moderator in self._moderators:
            if user in self._banned: self._banned.remove(user)
    def parse_command(self, chat_message, sender):
        if chat_message.startswith("/") and sender.authenticated:
            args = chat_message[1:].split(" ")
            command = args[0]
            if command == "setowner":
                user = self.get_user(args[1])
                if user: self.set_owner(user, sender)
            if command == "addadmin":
                user = self.get_user(args[1])
                if user: self.add_admin(user, sender)
            if command == "removeadmin":
                user = self.get_user(args[1])
                if user: self.remove_admin(user, sender)
            if command == "addmoderator":
                user = self.get_user(args[1])
                if user: self.add_moderator(user, sender)
            if command == "removemoderator":
                user = self.get_user(args[1])
                if user: self.remove_moderator(user, sender)
            if command == "ban":
                user = self.get_user(args[1])
                if user: self.ban(user, sender)
            if command == "pardon":
                user = self.get_user(args[1])
                if user: self.pardon(user, sender)
    def generate_messages(self, time, user=None):
        index = 0
        total = []
        for date in self.messagetime:
            if date>time:
                total.append({"name": self.messageuser[index].name, "message": self.messages[index], "date":str(self.messagetime[index])})
            index+=1
        return total