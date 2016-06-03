debug = True
secret_key = ''  # import os; os.urandom(24)
public = False
epoched = False
session_lifetime = 90 # in days
sentry_dsn = None  # change if you're using sentry exception handler

# database settings
db_host = 'localhost'
db_username = ''
db_password = ''
db_dbname = ''
db_port = 27017

# file for key material to use with hmac'ing ip addresses. 16 bytes
keyfile = ''

