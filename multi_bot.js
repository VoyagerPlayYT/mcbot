const mineflayer = require('mineflayer');

const HOST = 'mc.mineblaze.ru';
const VERSION = '1.16.5';
const BOT_COUNT = 100; 
const CONNECT_DELAY = 5000; // Увеличено до 5 сек для обхода защиты Render/Host

const firstNames = ['Andrey', 'Sasha', 'Dima', 'Artem', 'Ivan', 'Misha', 'Pasha'];
const lastNames = ['Game', 'Player', 'Pro', 'Craft', 'Mine', 'Top', 'Hub'];

function generateName() {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const num = Math.floor(Math.random() * 90000) + 10000;
    return `${fn}${ln}${num}`.substring(0, 16); // Лимит 16 символов
}

function createBot(id) {
    const name = generateName();
    console.log(`[Система] Запуск бота #${id} с ником ${name}`);

    const bot = mineflayer.createBot({
        host: HOST,
        username: name,
        version: VERSION,
        checkTimeoutInterval: 60000
    });

    bot.once('spawn', async () => {
        console.log(`[${name}] В игре.`);
        
        await new Promise(r => setTimeout(r, 3000));
        bot.chat('/reg 12345678 12345678');
        
        await new Promise(r => setTimeout(r, 5000));
        bot.chat('/s4');
        
        // Интервал спама
        setInterval(() => {
            if (bot.entity) {
                bot.chat('тест тест тест тест');
            }
        }, 4000 + (Math.random() * 2000));
    });

    // Тихий перезапуск при ошибках
    bot.on('error', () => {}); 
    bot.on('end', () => {
        setTimeout(() => createBot(id), 15000);
    });
}

// Постепенный запуск
(async () => {
    for (let i = 0; i < BOT_COUNT; i++) {
        createBot(i);
        await new Promise(r => setTimeout(r, CONNECT_DELAY));
    }
})();
