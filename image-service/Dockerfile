FROM eclipse-temurin:21-jre
WORKDIR /app
RUN mkdir -p uploads
COPY target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
