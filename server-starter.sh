# Depending on what sort of scripts you need to run.. For services and the like you should use upstart. But for a user script these should be launched as session scripts by gnome! Have a look under System > Preferences > Startup Applications.

#On a side note if you need some scripts to be run on terminal login you can add them to the .bash_login file in your home directory.

#For 14.04 and older

#A simple command (one which doesn't need to remain running) could use an Upstart job like:

# start on startup
# task
# exec /path/to/command
# Save this in a .conf file in /etc/init (if you need it to run as root when the system boots up), or in ~/.config/upstart (if you need it to run as your user when you log in).


