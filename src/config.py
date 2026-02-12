from os import environ as env
# automatically updates some dev envs.  need to remove for production.
try:
    __import__('envs')
except ImportError:
    pass
