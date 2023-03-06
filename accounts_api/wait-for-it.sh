#!/bin/bash
# Espera a que RabbitMQ esté disponible

set -e

host="$1"
shift
port="$1"
shift
cmd="$@"

until curl -s "$host:$port" >/dev/null; do
  >&2 echo "RabbitMQ en $host:$port no está disponible. Esperando..."
  sleep 1
done

>&2 echo "RabbitMQ en $host:$port está disponible"

exec $cmd
