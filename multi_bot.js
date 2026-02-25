const mineflayer = require('mineflayer');
const { ProxyAgent } = require('proxy-agent');
const axios = require('axios');

const HOST = 'mc.mineblaze.ru';
const VERSION = '1.16.5';
const BOT_COUNT = 100;

let proxyList = [];

async function updateProxies() {
    try {
        console.log('--- Обновление списка прокси... ---');
        const response = await axios.get('https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all');
        proxyList = response.data.split('\r\n').filter(p => p.trim().length > 0);
        console.log(`--- Готово. Доступно: ${proxyList.length} ---`);
    } catch (err) {
        console.log('Ошибка загрузки прокси.');
    }
}

function generateName() {
    const prefixes = ['Andrey', 'Sasha', 'Dima', 'Pro', 'Mega', 'Top', 'Killer', 'Player'];
    const suffix = Math.floor(Math.random() * 900000);
    return (prefixes[Math.floor(Math.random() * prefixes.length)] + suffix).substring(0, 16);
}

async function createBot(id) {
    const proxyRaw = proxyList[Math.floor(Math.random() * proxyList.length)];
    const agent = proxyRaw ? new ProxyAgent(`http://${proxyRaw}`) : null;

    const bot = mineflayer.createBot({
        // Буквенный адрес сервера
        host: 'mc.mineblaze.ru', 
        port: 25565,
        username: generateName(),
        version: VERSION,
        agent: agent,
        // Эта настройка заставляет Mineflayer слать именно буквенный адрес в пакете
        fakeHost: 'mc.mineblaze.ru', 
        connectTimeout: 30000,
        // Отключаем встроенный резолвер, чтобы прокся не тупила
        skipValidation: true 
    });

    // --- ЛОГИКА АНТИ-АФК И ДВИЖЕНИЯ ---
    const startMoving = () => {
        setInterval(() => {
            if (!bot.entity) return;

            // 1. Рандомный поворот головы
            const yaw = Math.random() * Math.PI * 2;
            const pitch = (Math.random() - 0.5) * Math.PI;
            bot.look(yaw, pitch);

            // 2. Имитация активности (присесть/прыгнуть)
            const action = Math.random();
            if (action < 0.2) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            } else if (action < 0.4) {
                bot.setControlState('sneak', true);
                setTimeout(() => bot.setControlState('sneak', false), 1000);
            }

            // 3. Небольшой шаг в сторону
            const dir = ['forward', 'back', 'left', 'right'][Math.floor(Math.random() * 4)];
            bot.setControlState(dir, true);
            setTimeout(() => bot.setControlState(dir, false), 300);

        }, 8000 + Math.random() * 5000); // Интервал активности 8-13 секунд
    };

    bot.once('spawn', async () => {
        console.log(`[${bot.username}] В игре. Прокси: ${proxyRaw || 'Direct'}`);
        
        // Регистрация
        await new Promise(r => setTimeout(r, 4000));
        bot.chat('/reg 12345678 12345678');
        
        // Переход в режим
        await new Promise(r => setTimeout(r, 5000));
        bot.chat('/s4');

        // Запуск движения
        startMoving();

        // Цикл спама
        setInterval(() => {
            if (bot.entity) {
                const randomTail = Math.random().toString(36).substring(7);
                bot.chat(`тест тест тест тест [${randomTail}]`);
            }
        }, 7000 + (Math.random() * 5000));
    });

    bot.on('error', () => {}); 
    bot.on('end', () => {
        setTimeout(() => createBot(id), 15000);
    });
}

(async () => {
    await updateProxies();
    setInterval(updateProxies, 10 * 60 * 1000);

    for (let i = 0; i < BOT_COUNT; i++) {
        createBot(i);
        // Интервал между заходами ботов (7 секунд), чтобы не триггерить защиту
        await new Promise(r => setTimeout(r, 7000));
    }
})();
