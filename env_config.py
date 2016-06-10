import os
import distutils.util

try:
    from config import *
except ImportError:
    from config_example import *


def env_bool(env, default):
    if os.environ.get(env):
        return distutils.util.strtobool(os.environ.get(env))
    else:
        return default


def env_str(env, default):
    return os.getenv(env, default)


def env_int(env, default):
    if os.environ.get(env):
        return int(os.environ.get(env))
    else:
        return default

debug = env_bool('DEBUG', debug)
db_host = env_str('DB_HOST', db_host)
db_username = env_str('DB_USERNAME', db_username)
db_password = env_str('DB_PASSWORD', db_password)
db_dbname = env_str('DB_DBNAME', db_dbname)
db_port = env_int('DB_PORT', db_port)

