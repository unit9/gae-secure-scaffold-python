# Secure GAE Scaffold (UNIT9)

## Introduction
----

### Disclaimer
Please note: this is not an official Google product.  
This is a [UNIT9](http://www.unit9.com) fork of the Secure GAE Scaffold. You
can find the original repository
[here](https://github.com/google/gae-secure-scaffold-python).

This contains a boilerplate AppEngine application meant to provide a secure
base on which to build additional functionality. It has been extended with a
gulp-based front end build system.

### Structure

* / - top level directory for common files, e.g. app.yaml
* /src - directory for all source code
* /static - directory for static content
* /templates - directory for Django/Jinja2 templates your app renders.
* /templates/soy - directory for Closure Templates your application uses.

The scaffold provides the following basic security guarantees by default through
a set of base classes found in `src/base/handlers.py`.  These handlers:

1. Set assorted security headers (Strict-Transport-Security, X-Frame-Options,
   X-XSS-Protection, X-Content-Type-Options, Content-Security-Policy) with
   strong default values to help avoid attacks like Cross-Site Scripting (XSS)
   and Cross-Site Script Inclusion.  See  `_SetCommonResponseHeaders()` and
   `SetAjaxResponseHeaders()`.
1. Prevent the XSS-prone construction of HTML via string concatenation by
   forcing the use of a template system (Django/Jinja2 supported).  The
   template systems have non-contextual autoescaping enabled by default.
   See the `render()`, `render_json()` methods in `BaseHandler` and
   `BaseAjaxHandler`. For contextual autoescaping, you should use Closure
   Templates in strict mode (<https://developers.google.com/closure/templates/docs/security>).
1. Test for the presence of headers that guarantee requests to Cron or
   Task endpoints are made by the AppEngine serving environment or an
   application administrator.  See the `dispatch()` method in `BaseCronHandler`
   and `BaseTaskHandler`.
1. Verify XSRF tokens by default on authenticated requests using any verb other
   that GET, HEAD, or OPTIONS.  See the `_RequestContainsValidXsrfToken()`
   method for more information.

In addition to the protections above, the scaffold monkey patches assorted APIs
that use insecure or dangerous defaults (see `src/base/api_fixer.py`).

Obviously no framework is perfect, and the flexibility of Python offers many
ways for a motivated developer to circumvent the protections offered.  Under
the assumption that developers are not malicious, using the scaffold should
centralize many security mechanisms, provide safe defaults, and structure the
code in a way that facilitates security review.

Sample implementations can be found in `src/handlers.py`.  These demonstrate
basic functionality, and should be removed / replaced by code specific to
your application.

## Dependency Setup
----

1. Install vagrant  
http://vagrantup.com/

1. Instal required Vagrant plugins  
```$ vagrant plugin install vagrant-host-shell```

1. Install Ansible
```$ brew install ansible```

1. Install VirtualBox  
https://www.virtualbox.org/

1. Clone the repo

1. Enter the project directory  
```$ cd $PROJECT_DIR ```

1. Run Vagrant  
```$ vagrant up```

## Development process 
----

####Start up Vagrant:
`$ vagrant up`

#### Log in into Vagrant:
`l$ vagrant ssh`


## Scaffold Setup
----

These instructions assume a working directory of the repository root.

### Local Development
To run the development appserver locally:

`$ npm run dev`

### Testing
To run unit tests:

`python run_tests.py ~/bin/google_appengine src`

Note that the development appserver will be running on a snapshot of code
at the time you run it.

### Deployment
To build final application:

`$ npm run prod`

To deploy to AppEngine:

`$ ./util.sh -p <app-id>`

## Notes
----

The `/base` and `/template` and `/examples` directories are replicated in `out/`
, and the files in `src/` are rebased into `out/` (so `src/base/foo.py` becomes
`out/base/foo.py`).

Files directly in '/src' are rebased into '/out' (e.g. `src/main.py` becomes 
`out/main.py`).

The `/static` directory is generated based on src/app folder. Html files are 
build based on jade files. JavaScript files are compiled from coffeeScript files.

## Detailed Dependency Information (TODO)
----

The compiler is invoked with the default namespace of 'app.'  The compiled
Javascript is written to `out/static/app.js`.

You will also need the Closure Library (in the closure-library submodule of
this repository).

You can find more on the Closure Library here:
  <https://github.com/google/closure-library>

To use it, you will need to check out the code as a submodule by running the
following commands from the base directory of this repository:

  `git submodule add <https://github.com/google/closure-library/> closure-library`

  `git commit -m "Initial import of Closure Library"`

* (Optional, if using Closure Templates): The Closure Template compiler (in
  addition to the Closure Compiler), located at:

   `$HOME/bin/google_closure_templates`

You can find / download Closure Templates at:
  <https://github.com/google/closure-templates>

You will need all the files from this archive in the above directory:
  closure-templates-for-javascript-latest.zip

You can build this using the ant target "zips-for-release", or download a
prebuilt version (the URL is in the Dependency Setup section).

The deployment script checks for the presence of .soy files in templates/soy.
If found, they are compiled to a single Javascript file using the
SoyToJsSrcCompiler.jar in the previously mentioned directory.  The resulting
Javascript file is stored in static/app.soy.js, alongside the `soyutils.js`
library provided with the Closure Templates bundle that is necessary to include
on any page you plan to use Closure Templates.
