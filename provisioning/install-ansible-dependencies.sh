#!/bin/bash
# Host machine provisioner.

# Install Ansible dependencies.
echo "Installing Ansible dependencies..."
pushd /vagrant/provisioning
./install-ansible-dependencies
popd