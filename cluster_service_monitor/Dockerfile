# Imagen base
FROM node:16-alpine

# Crear el directorio de la aplicación
WORKDIR /app

# Copiar los archivos de la aplicación
COPY package*.json ./
COPY . .

# Agregar una espera de 10 segundos antes de iniciar el servicio
CMD ["sh", "-c", "sleep 10 && npm start"]

CMD ['apt', 'update']
CMD ['apt', 'install', 'iputils-ping']
CMD ['apt', 'install', 'net-tools']
CMD ['npm', 'install','-g npm']

# Instalar las dependencias
RUN npm install

# Exponer el puerto de la aplicación
EXPOSE 3005

#CMD [ "ping", "rabbitmq" ]

# Ejecutar la aplicación
CMD [ "node", "index.js" ]