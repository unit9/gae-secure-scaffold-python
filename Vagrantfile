# -*- mode: ruby -*-
# vi: set ft=ruby :

# Set Vagrant API version for compatibility.
VAGRANTFILE_API_VERSION = "2"

# Begin configuration.
Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  
  # Set the VM BOX to latest Ubuntu.
  config.vm.box = "ubuntu/trusty64"

  # Set automatic box updates (recommended).
  config.vm.box_check_update = true

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine.
  config.vm.network "forwarded_port", guest: 8080, host: 8080
  config.vm.network "forwarded_port", guest: 8000, host: 8000

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  
  # Give the box a bit more power.
  config.vm.provider "virtualbox" do |v|
    v.memory = 2048
    v.cpus = 2
  end

end
