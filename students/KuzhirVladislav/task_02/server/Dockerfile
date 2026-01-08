FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=/root/.m2 \
    mvn clean package -DskipTests

FROM eclipse-temurin:21-jre AS extract
WORKDIR /app
COPY --from=build /app/target/server-*.jar ./server.jar
RUN java -Djarmode=layertools -jar server.jar extract

FROM eclipse-temurin:21-jre
RUN apt-get update && apt-get install -y --no-install-recommends curl=7.* && rm -rf /var/lib/apt/lists/*
WORKDIR /app
VOLUME /tmp
COPY --from=extract /app/dependencies/ ./
COPY --from=extract /app/spring-boot-loader/ ./
COPY --from=extract /app/snapshot-dependencies/ ./
COPY --from=extract /app/application/ ./
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
