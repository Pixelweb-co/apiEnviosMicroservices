# Imagen base
FROM node:16-alpine

# Crear el directorio de la aplicación
WORKDIR /app

# Copiar los archivos de la aplicación
COPY package*.json ./
COPY . .


CMD ['apt', 'update']

CMD ['apt', 'install', 'iputils-ping']
CMD ['apt', 'install', 'net-tools']

CMD ['npm', 'install','-g npm']

# Instala curl
RUN apk --no-cache add curl

# Instalar las dependencias
RUN npm install

# Exponer el puerto de la aplicación
EXPOSE 3004


# Esperar a que el servicio de MongoDB esté disponible

RUN chmod +x ./wait-for-it.sh

CMD ["sh", "./wait-for-it.sh", "rabbitmq", "5672", "node", "index.js"]

#CMD ["node", "index.js"]
