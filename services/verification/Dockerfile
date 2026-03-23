FROM rust:1.83-slim AS builder
WORKDIR /app
COPY . .
RUN cargo build --release --bin red-salud-verification

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/red-salud-verification /usr/local/bin/
EXPOSE 8090
CMD ["red-salud-verification"]
