import json
import logging

from base import constants
from base import handlers

class ApiHandler(handlers.BaseHandler):

  def get(self):
    self.render('health.tpl')