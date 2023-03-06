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
    nc -z rabbitmq 5672
    if [ $? -eq 0 ]; then
        echo "Rabbitmq presente"
        exec node index.js
        break
    else
        echo "El puerto $PORT está cerrado en $HOST. Intentando de nuevo en 1 segundos..."
        sleep 1
    fi
done


