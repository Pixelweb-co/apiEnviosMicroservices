# Imagen base
FROM node:16-alpine

# Crear el directorio de la aplicación
WORKDIR /app

# Copiar los archivos de la aplicación
COPY package*.json ./
COPY . .


CMD ['apt', 'update']
CMD ['npm', 'install','-g npm']

CMD ['apt', 'install', 'iputils-ping']
CMD ['apt', 'install', 'net-tools']


# Instalar las dependencias
RUN npm install

# Exponer el puerto de la aplicación
EXPOSE 3000

# Esperar a que el servicio de MongoDB esté disponible
COPY ./wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh

CMD ["/usr/local/bin/wait-for-it.sh", "rabbitmq", "5672", "node", "index.js"]
