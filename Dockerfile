FROM node:18-alpine

# ОБЯЗАТЕЛЬНО: Создаем рабочую директорию
WORKDIR /usr/src/app

# Копируем конфиги
COPY package.json ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем ВЕСЬ контент текущей папки
COPY . .

# Проверяем, что файл multi_bot.js реально существует внутри контейнера
RUN ls -la

# Запускаем именно multi_bot.js
CMD [ "node", "multi_bot.js" ]
