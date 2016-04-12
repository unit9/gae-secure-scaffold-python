#!/bin/bash
# Utility script for the secure GAE application scaffold.

die() {
  echo "FATAL: $@" 1>&2
  exit 1
}

warn() {
  echo -n -e "\a" 1>&2
  echo "WARN: $@" 1>&2
}

get_or_die() {
  local x=`which $1`
  if [[ -z "$x" ]] ; then
    die "could not find $1"
  fi
  eval "$2=$x"
}

get_or_die "awk" "AWK"
get_or_die "cat" "CAT"
get_or_die "cp" "CP"
get_or_die "curl" "CURL"
get_or_die "cut" "CUT"
get_or_die "dirname" "DIRNAME"
get_or_die "find" "FIND"
get_or_die "git" "GIT"
get_or_die "mkdir" "MKDIR"
get_or_die "python" "PYTHON"
get_or_die "rm" "RM"
get_or_die "sed" "SED"
get_or_die "tr" "TR"
get_or_die "unzip" "UNZIP"
get_or_die "wc" "WC"

UTIL_SH_RELATIVE_DIR=`$DIRNAME ${0}`

if [[ "$UTIL_SH_RELATIVE_DIR" != "." ]] ; then
  die "util.sh must be run from $PWD/$UTIL_SH_RELATIVE_DIR"
fi

APPENGINE_BASE_DIR=$HOME/google_appengine
APPCFG=$APPENGINE_BASE_DIR/appcfg.py
DEV_APPSERVER=$APPENGINE_BASE_DIR/dev_appserver.py
CLOSURE_COMPILER_JAR=$HOME/bin/google_closure/compiler.jar
CLOSURE_TEMPLATES_BASE_DIR=$HOME/bin/google_closure_templates/
OUTPUT_DIR=$PWD/out

usage() {
  echo "Usage: util.sh " 1>&2
  echo "    -h           Display this help" 1>&2
  echo "    -b           Build" 1>&2
  echo "    -s           Run this in dev_appserver" 1>&2
  echo "    -p <appid>   Push to appengine with specified application id" 1>&2
  echo "    -u <version> Update AppEngine SDK to specified version" 1>&2
}

compute_version_string() {
  $GIT status 2>&1 >/dev/null
  if [[ $? -ne 0 ]] ; then
    die "not inside a git repository"
  fi
  local commit=`$GIT log --format=oneline -n 1 | $AWK '{ print $1 }' | $CUT -c1-16`
  local uncommitted=`$GIT status | $WC -l`
  local suffix=''
  if [[ $uncommitted -ne '0' ]] ; then
    local suffix='dev'
  fi
  echo $commit-$suffix
}

gen_app_yaml() {
  if [[ ! -e "$PWD/app.yaml.base" ]] ; then
    die "no app.yaml.base in current directory"
  fi
  $CAT $PWD/app.yaml.base | $SED -e "s/__APPLICATION__/$1/" \
    -e "s/__VERSION__/$2/" > $OUTPUT_DIR/app.yaml
}

clean_output_dir() {
  if [[ -e $OUTPUT_DIR ]] ; then
    $RM -rf $OUTPUT_DIR
  fi
  $MKDIR $OUTPUT_DIR
}

reset_output_dir() {
  $CP -R $PWD/third_party/py/* $OUTPUT_DIR
  $CP -R $PWD/src/* $OUTPUT_DIR
  $CP -R $PWD/templates $OUTPUT_DIR
  $RM -rf $OUTPUT_DIR/app
}

build() {
  if [[ ! -e $DEV_APPSERVER ]] ; then
    die "dev_appserver.py not found at $DEV_APPSERVER"
  fi
  reset_output_dir
  local version=$(compute_version_string)
  gen_app_yaml "dev" "$version"
}

serve() {
  if [[ ! -e $DEV_APPSERVER ]] ; then
    die "dev_appserver.py not found at $DEV_APPSERVER"
  fi
  $DEV_APPSERVER --skip_sdk_update_check true --host=0.0.0.0 $OUTPUT_DIR
}

deploy() {
  if [[ ! -e $APPCFG ]] ; then
    die "appcfg.py not found at $APPCFG"
  fi
  if [[ $1 =~ ^[a-zA-Z0-9-]+$ ]] ; then
    reset_output_dir
    local version=$(compute_version_string)
    gen_app_yaml $1 $version
    gen_prod_js
    $APPCFG --no_cookies --skip_sdk_update_check --noauth_local_webserver update $OUTPUT_DIR
  else
    die "invalid application name $1"
  fi
}

update_sdk() {
  SDK_VERSION=$1; shift
  SDK_URL="https://storage.googleapis.com/appengine-sdks/featured/google_appengine_${SDK_VERSION}.zip"
  SDK_ZIP="/tmp/google_appengine_${SDK_VERSION}.zip"
  if [[ ! -f $SDK_ZIP ]] ; then
    if ! $CURL -sSfL -o $SDK_ZIP $SDK_URL ; then
      die "Could not download: ${SDK_URL}"
    fi
  fi
  if [[ -d $APPENGINE_BASE_DIR ]] ; then
    rm -rf $APPENGINE_BASE_DIR
  fi
  # XXX: the zip already contains the folder named "google_appengine".
  # Using $HOME feels a bit wrong, but I can't see a better way here.
  $UNZIP -q -d $HOME $SDK_ZIP
  if [[ ! -d $APPENGINE_BASE_DIR ]] ; then
    die "Failed to extract the SDK directory"
  fi
  if [[ ! -x $APPCFG ]] ; then
    die "Failed to extract the SDK files"
  fi
}

args=`getopt hbscp:u: $*`

if [[ $? -ne 0 ]] ; then
  usage
  exit 1
fi

set -- $args
while [[ $# -ne 0 ]] ; do
  case "$1" in
    -h) usage; exit 0;;
    -b) build; shift;;
    -s) serve; shift;;
    -p) deploy $2; shift; shift ;;
    -u) update_sdk $2; shift; shift ;;
    -c) clean_output_dir; shift;;
    --) shift; break;;
    *) die "unknown option \"$1\""; usage;;
  esac
done
