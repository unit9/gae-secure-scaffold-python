#!/bin/bash
# Host machine provisioner.

# Install Ansible dependencies.
echo "Installing Ansible dependencies..."
pushd /vagrant/provisioning
#./install-ansible-dependencies
sudo ansible-galaxy install -r roles/gae/meta/requirements.yml
sudo ansible-galaxy install -r roles/u9-common/meta/requirements.yml
popd