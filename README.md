# 📊 CAP + OpenTelemetry + Elastic APM

Este proyecto es una aplicación CAP (SAP Cloud Application Programming Model) instrumentada con **OpenTelemetry** y conectada a **Elastic APM** usando un **OpenTelemetry Collector** como proxy.

## ✅ ¿Qué resuelve este proyecto?

Permite:

- Instrumentar una app Node.js CAP con OpenTelemetry.
- Exportar **trazas, métricas y logs** hacia Elastic Observability.
- Separar la autenticación del exportador mediante un **collector intermedio**.
- Ejecutar todo de forma local con **Docker Compose**.

## 🧱 Arquitectura

```
CAP App (Node.js)
      │
      │  OTLP HTTP
      ▼
OpenTelemetry Collector
      │
      │  OTLP con token (Bearer)
      ▼
Elastic APM (Elastic Cloud)
```

## 🛠️ Archivos principales

- `start-cap.js`: Punto de entrada personalizado que inicia la app Express + CAP + OpenTelemetry.
- `srv/otel.js`: Configura la instrumentación de OpenTelemetry con exportadores HTTP.
- `otel-collector-config.yaml`: Configuración del OpenTelemetry Collector con exportador OTLP a Elastic.
- `.env`: Variables de entorno seguras (token, endpoint, nombre del servicio).
- `docker-compose.yml`: Orquesta la app CAP + el OpenTelemetry Collector.

## 🔍 Endpoints de prueba

- `GET /success`: Endpoint exitoso que genera una traza OK.
- `GET /error`: Endpoint que lanza un error para observar una traza fallida.

## ▶️ ¿Cómo lo ejecuto?

1. Clona este repo
2. Copiá el archivo `.env.example` a `.env` y completalo con tus datos de Elastic.
3. Ejecutá:

```bash
docker compose up --build
```

4. Probá los endpoints:

```bash
curl http://localhost:4004/success
curl http://localhost:4004/error
```

5. Mirá los datos en tu instancia de **Elastic Observability**.

## 📦 Requisitos

- Cuenta en Elastic Cloud con APM habilitado.
- Docker y Docker Compose instalados.
- Node.js si querés ejecutar la app localmente fuera del contenedor.
