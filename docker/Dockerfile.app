FROM node:16-bullseye

# Instalar dependencias nativas geoespaciales y compilación para Mapnik
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    python3-pip \
    libmapnik-dev \
    mapnik-utils \
    gdal-bin \
    libspatialindex-dev \
    libgeos-dev \
    libproj-dev \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar definiciones de dependencias
COPY app/package*.json ./

# Instalar dependencias de Node
RUN npm install

# Copiar el resto del código de la app
COPY app/ ./

EXPOSE 3000 3001

CMD ["npm", "start"]
