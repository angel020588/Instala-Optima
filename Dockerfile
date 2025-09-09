# Usa Node.js oficial
FROM node:18

# Crea directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos de dependencias
COPY package*.json ./
RUN npm install

# Copia el resto del código
COPY . .

# Puerto que usará Cloud Run
EXPOSE 8080

# Comando para ejecutar tu app
CMD ["node", "index.js"]
