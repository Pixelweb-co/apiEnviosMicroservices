# Imagen base
FROM node:16-alpine

# Crear el directorio de la aplicación
WORKDIR /app

# Copiar los archivos de la aplicación
COPY package*.json ./
COPY . .

# Instalar las dependencias
RUN npm install

# Exponer el puerto de la aplicación
EXPOSE 3000

# Ejecutar la aplicación
CMD [ "node", "index.js" ]