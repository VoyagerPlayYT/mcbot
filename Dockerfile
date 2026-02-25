# Используем стабильную версию Node.js
FROM node:18-slim

# Создаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем исходный код
COPY . .

# Команда запуска
CMD ["npm", "start"]
