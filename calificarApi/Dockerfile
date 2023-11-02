FROM adoptopenjdk/openjdk11:alpine
LABEL maintainer="Edwin guevara"

# Copiar el código fuente de la aplicación a la imagen
COPY . /app
WORKDIR /app

# Instalar dependencias de la aplicación
RUN ./mvnw package -DskipTests

# Exponer el puerto 8080
EXPOSE 8080

# Iniciar la aplicación
CMD ["java", "-jar", "target/calificarApi-0.0.1-SNAPSHOT.jar"]