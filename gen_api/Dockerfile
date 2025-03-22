# Utilise une image de base Python
FROM python:3.10-slim

# Installer git, libgl1, et autres dépendances pour OpenCV
RUN rm -rf /var/lib/apt/lists/* && apt-get update && apt-get install -y --fix-missing \
    git \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    libavformat-dev \
    libswscale-dev \
    libv4l-dev \
    libx264-dev \
    && apt-get clean

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Mettre à jour pip
RUN pip install --upgrade pip

# Installer OpenCV séparément
RUN pip install --no-cache-dir opencv-python

# Copier requirements.txt dans le conteneur
COPY ./requirements.txt /app/requirements.txt

# Installer les dépendances Python sans cache
RUN pip install --no-cache-dir -r requirements.txt

# Désactiver temporairement les vérifications SSL (si possible et sûr dans votre cas)
RUN pip config set global.trusted-host "pypi.org pypi.python.org files.pythonhosted.org"

# Copier le code de l'API
COPY . .

# Exposer le port de l'API
EXPOSE 8000

# Démarrer l'application avec waitress-serve
CMD ["waitress-serve", "--port=8000", "--threads=1", "--channel-timeout=3000", "app:app"]