# Workspace uses Rust 2024 edition, which requires toolchain >= 1.85.
FROM rust:1.85-slim AS builder
WORKDIR /app
# Install pkg-config + openssl headers so reqwest's default TLS compiles.
RUN apt-get update \
 && apt-get install -y --no-install-recommends pkg-config libssl-dev ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY . .
RUN cargo build --release --bin red-salud-gateway

FROM debian:bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates libssl3 \
 && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/red-salud-gateway /usr/local/bin/
EXPOSE 8080
ENV HOST=0.0.0.0 \
    PORT=8080
CMD ["red-salud-gateway"]
