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
