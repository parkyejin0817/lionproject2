FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Health check용 curl 설치
RUN apk add --no-cache curl

COPY build/libs/lionproject2-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
