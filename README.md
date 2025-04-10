# SAP CAP + OpenTelemetry + Elastic Observability

Este proyecto es una app SAP CAP instrumentada con OpenTelemetry, que envía trazas, métricas y logs a Elastic a través de un OpenTelemetry Collector.

## Uso

```bash
# Clona el repositorio
git clone 
cd cap-otel-elastic

# Copia tu .env con las credenciales de Elastic

# Ejecuta la app
docker compose up --build
