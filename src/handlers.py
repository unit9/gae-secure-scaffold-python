# Copyright 2014 Google Inc. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
#     Unless required by applicable law or agreed to in writing, software
#     distributed under the License is distributed on an "AS IS" BASIS,
#     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#     See the License for the specific language governing permissions and
#     limitations under the License.
import json
import logging
from urlparse import urlparse

from google.appengine.api import users

from base import constants
from base import handlers

# Minimal set of handlers to let you display main page with examples
# class RootHandler(handlers.BaseHandler):
#
#   def get(self):
#     self.render('base.tpl')


class CspHandler(handlers.BaseAjaxHandler):

    def post(self):
        try:
            report = json.loads(self.request.body)
            logging.warn('CSP Violation: %s' % (json.dumps(
                         report['csp-report'])))
            self.render_json({})
        except:
            self.render_json({'error': 'invalid CSP report'})


class MainPage(handlers.BaseHandler):
    """Serves static index.html with chosen authorization method

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
