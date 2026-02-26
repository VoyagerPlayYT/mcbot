# Используем стабильную версию Node.js на базе Alpine для экономии ресурсов
FROM node:18-alpine

# Создаем рабочую директорию внутри контейнера

# Копируем package.json и устанавливаем зависимости
COPY package.json ./
RUN npm install --production

# Копируем основной код скрипта
COPY multi_bot.js ./

# Команда для запуска атаки при старте контейнера
CMD [ "node", "index.js" ]
