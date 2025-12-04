# Proyecto SOA — Estructura

Este repositorio está estructurado para separar claramente el backend del frontend.

- `backend/`: Servicio API (Spring Boot). Antes estaba en `eventos-api/`.
- `frontend/`: Código del cliente (actualmente un placeholder `index.html`).
- `docker-compose.yml`: Orquestación de servicios (MongoDB y API).
- `.env`: Variables de entorno usadas por `docker-compose`.

## Ejecutar el backend con MongoDB

Requisitos: Docker y Docker Compose.

1. Configura variables en `.env` si deseas valores distintos.
2. Levanta los servicios:
   
   ```bash
   docker compose up -d --build
   ```

3. API disponible en `http://localhost:8081`.

## Desarrollo del frontend

- Si vas a crear una SPA, dentro de `frontend/` puedes inicializar con Vite, por ejemplo:
  
  ```bash
  cd frontend
  npm create vite@latest
  npm install
  npm run dev
  ```

- Si prefieres algo estático, puedes servir `frontend/index.html` con cualquier servidor estático.

## Notas

- El `docker-compose.yml` ya apunta a `./backend` como contexto de build.
- La imagen de la API expone el puerto `8081` (configurable con `APP_PORT` en `.env`).

