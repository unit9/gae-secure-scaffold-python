from urlparse import urlparse

from google.appengine.api import users

from base import handlers
from base import constants


# Webapp2 parameter parser for handlers.
def param(name, description, _type=None, required=None, default=None):
    def wrap(foo):
        def wrapped(self, *args, **kwrgs):
            if self.request.method == 'POST':
                param_name = self.request.POST.get(name, default)
            else:
                param_name = self.request.get(name, default)

            if not param_name and required:
                resp = {'status': 400,
                        'msg': 'Parameter {} is required'.format(name)}
                return self.render_json(resp)
            if _type:
                param_name = _type(param_name)
            kwrgs.update({name: param_name})
            return foo(self, *args, **kwrgs)
        return wrapped
    return wrap


class MainPage(handlers.BaseHandler):
    """Serves static index.html with chosen method

    Avaible methods:
        * basic_auth (default)
        * google

    Remember:
        * To choose method edit AUTHORIZATION_METHOD in base/constants.py
        * [google_method] You need to uncomment login: required in
          app.yaml.base
        * [google_method] To update email white list add an email to file:
          base/constants.py
    """

    def check_basic_auth(self):
        return self.request.authorization == constants.BASIC_AUTH

    def check_google_auth(self):
        user = users.get_current_user()
        if not user:
            return False
        _, auth_domain = user.email().split("@", 1)
        is_domain = auth_domain in constants.EMAIL_WHITELIST
        is_email = user.email() in constants.EMAIL_WHITELIST
        if is_domain or is_email:
            return True

    def render_with_auth(self, path, _auth_type='basic_auth'):
        auth_option = {
            'basic_auth': self.check_basic_auth(),
            'google': self.check_google_auth()
        }

        is_authorized = auth_option[_auth_type]

        if is_authorized:
            return self.serve_index(path)

        if _auth_type == 'basic_auth':
            self.response.headers.add('WWW-Authenticate',
                                      'Basic realm="Login Required"')
            self.response.set_status(401)
            return

        return self.redirect(users.create_logout_url('/'))

    def serve_index(self, path):
        self.render(path)

    def get(self):
        parsed_url = urlparse(self.request.url)
        static_path = parsed_url.path
        if not static_path or static_path == '/':
            static_path = '/index.html'

        self.render_with_auth(static_path,
                              _auth_type=constants.AUTHORIZATION_METHOD)
