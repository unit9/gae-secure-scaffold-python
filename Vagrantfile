# -*- mode: ruby -*-
# vi: set ft=ruby :

# Set Vagrant API version for compatibility.
VAGRANTFILE_API_VERSION = "2"

# Define required Vagrant plugins.
required_plugins = %w( vagrant-guest_ansible )

# Install required Vagrant plugins.
plugins_to_install = required_plugins.select { |plugin| not Vagrant.has_plugin? plugin }
if not plugins_to_install.empty?
  if system "vagrant plugin install #{plugins_to_install.join(' ')}"
    puts "Successfully installed plugins, run `vagrant #{ARGV.join(' ')}` again"
    exit
  else
    abort "Installation of one or more plugins has failed. Aborting."
  end
end

# Begin configuration.
Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  
  # Set the VM BOX to latest Ubuntu.
  config.vm.box = "ubuntu/trusty64"

  # Set automatic box updates (recommended).
  config.vm.box_check_update = true

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine.
  config.vm.network "forwarded_port", guest: 3000, host: 3000
  config.vm.network "forwarded_port", guest: 3001, host: 3001
  config.vm.network "forwarded_port", guest: 8080, host: 8080
  config.vm.network "forwarded_port", guest: 8000, host: 8000
  
  # Give the box a bit more power.
  config.vm.provider "virtualbox" do |v|
    v.memory = 2048
    v.cpus = 2
  end

  # Run empty playbook to force installation of Ansible before we install reles.
  config.vm.provision :guest_ansible do |ansible|
    ansible.playbook = "provisioning/empty.yml"
  end

  # Install all Ansible dependencies on the guest machine.
  config.vm.provision :shell do |shell|
    shell.path = "provisioning/install-ansible-dependencies.sh"
  end

  # Run Ansible to provision the Vagrant guest.
  config.vm.provision :guest_ansible do |ansible|
    ansible.playbook = "provisioning/playbook.yml"
  end

end
