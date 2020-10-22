import json

class DialogSys(object):
    def __init__(self):
        pass

    def decode(self, data):
        print('message_list', data['message_list'])
        print('new_message', data['new_message'])
        x = {'responses':[['I am happy', 'I feel good', 'I have a nice breakfast'], ['I plan to go to hawai', 'I drive my cousin to Irvine', 'I stay at home and play guitar']], 'tokenized_message_list': data['message_list']+data['new_message']}
        return x