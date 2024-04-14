from os import environ as env
# automatically updates some dev envs.  need to remove for production.
try:
    __import__('envs.py')
except ImportError:
    pass

HotspotsURL = env.get('HotspotsURL', 'https://asimonson.com/hotspots')