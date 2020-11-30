FROM gitpod/workspace-full

# Install custom tools, runtimes, etc.
# For example "bastet", a command-line tetris clone:
# RUN brew install bastet
#
# More information: https://www.gitpod.io/docs/config-docker/

USER gitpod
RUN sudo apt-get -q update \
  && sudo apt-get install -y \
  fonts-firacode \
  && sudo rm -rf /var/lib/apt/lists/*
