FROM clojure:temurin-21-tools-deps-1.12.6.1673-bookworm-slim
WORKDIR /app
COPY deps.edn ./
RUN clojure -P -M:run:test
COPY src ./src
COPY test ./test
ENV HOST=0.0.0.0 PORT=3000
EXPOSE 3000
CMD ["clojure", "-M:run"]
