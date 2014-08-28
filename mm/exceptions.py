
class CraftingException(Exception):
    def __init__(self, value):
        self.message = value
    def __str__(self):
         return repr(self.message)
