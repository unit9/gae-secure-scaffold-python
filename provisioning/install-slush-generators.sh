#!/bin/bash

echo installing slush generators...
modules=$(find /vagrant/generators -name "slush-*")
for module in $modules; do
  pushd $module
  npm link .
  popd
done
