#!/bin/bash
# Espera a que RabbitMQ esté disponible

set -e

host="$1"
shift
port="$1"
shift
cmd="$@"

while :
do
    nc -z $host $post
    if [ $? -eq 0 ]; then
        echo "El puerto $PORT está abierto en $HOST"
        exec $cmd
        break
    else
        echo "El puerto $PORT está cerrado en $HOST. Intentando de nuevo en 5 segundos..."
        sleep 5
    fi
done


