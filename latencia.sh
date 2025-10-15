#!/bin/bash

# Script para medir a latência de uma API

# Podman
sudo podman run --rm -i -v $(pwd):/scripts grafana/k6 run /scripts/teste-carga-login.js