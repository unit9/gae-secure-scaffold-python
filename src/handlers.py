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
import base64
import json
import logging
from urlparse import urlparse

from google.appengine.api import users
import jinja2

from base import handlers
import settings

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

    Avaible authorization methods:
        * basic_auth (default)
        * google

    Remember:
        * To choose method edit AUTHORIZATION_METHOD in settings.py
        * [google_auth] You need to uncomment login: required in
          app.yaml.base
        * [google_auth] To update email white list add an email to file:
          settings.py
    """

    def check_basic_auth(self):
        if self.request.authorization:
            authorization = base64.b64decode(self.request.authorization[1])
        else:
            return False
        login, password = authorization.split(':')
        return (login == settings.ADMIN_LOGIN and
                password == settings.ADMIN_PASSWORD)

    def check_google_auth(self):
        user = users.get_current_user()
        if not user:
            return False
        _, auth_domain = user.email().split("@", 1)
        is_domain = auth_domain in settings.EMAIL_WHITELIST
        is_email = user.email() in settings.EMAIL_WHITELIST
        if is_domain or is_email:
            return True
        return False

    def setup_basic_auth_headers(self):
        self.response.headers.add('WWW-Authenticate',
                                  'Basic realm="Login Required"')
        self.response.set_status(401)

    def render_with_auth(self, path):
        auth_option = {
            'basic_auth': self.check_basic_auth,
            'google_auth': self.check_google_auth
        }

        is_authorized = auth_option[settings.AUTHORIZATION_METHOD]()

        if is_authorized:
            return self.render(path)

        if settings.AUTHORIZATION_METHOD == 'basic_auth':
            self.setup_basic_auth_headers()
            return

        return self.redirect(users.create_logout_url('/'))

    def get(self):
        parsed_url = urlparse(self.request.url)
        static_path = parsed_url.path
        if static_path == '/':
            static_path = '/index.html'
        try:
            self.render_with_auth(static_path)
        except jinja2.exceptions.TemplateNotFound:
            self.response.set_status(404)
            self.render_with_auth('/not_found.html')
