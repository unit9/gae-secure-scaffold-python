import os


AUTHORIZATION_METHOD = os.environ.get('AUTHORIZATION_METHOD')

# Email allowed to log in (only when AUTHORIZATION_METHOD == 'google_auth')
EMAIL_WHITELIST = {
    'unit9.com',
    'test@example.com'
}

ADMIN_LOGIN = os.environ.get('ADMIN_LOGIN')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD')
