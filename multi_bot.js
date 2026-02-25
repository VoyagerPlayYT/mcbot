const mineflayer = require('mineflayer');
const { ProxyAgent } = require('proxy-agent'); // Изменено здесь
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
    const prefixes = ['Andrey', 'Sasha', 'Dima', 'Pro', 'Mega', 'Top', 'Killer'];
    const suffix = Math.floor(Math.random() * 900000);
    return (prefixes[Math.floor(Math.random() * prefixes.length)] + suffix).substring(0, 16);
}

async function createBot(id) {
    const proxyRaw = proxyList[Math.floor(Math.random() * proxyList.length)];
    // В новых версиях proxy-agent используется просто строка прокси
    const agent = proxyRaw ? new ProxyAgent(`http://${proxyRaw}`) : null;

    const bot = mineflayer.createBot({
        host: HOST,
        username: generateName(),
        version: VERSION,
        agent: agent, // Теперь передаем корректный объект
        connectTimeout: 20000
    });

    bot.once('spawn', async () => {
        console.log(`[${bot.username}] Зашел!`);
        
        await new Promise(r => setTimeout(r, 4000));
        bot.chat('/reg 12345678 12345678');
        
        await new Promise(r => setTimeout(r, 5000));
        bot.chat('/s4');

        setInterval(() => {
            if (bot.entity) {
                // Добавляем рандомный хвост, чтобы антиспам не палил
                const randomTail = Math.random().toString(36).substring(7);
                bot.chat(`тест тест тест тест [${randomTail}]`);
            }
        }, 6000 + (Math.random() * 4000));
    });

    bot.on('error', (err) => {
        // console.log(`[Ошибка] ${err.message}`);
    }); 

    bot.on('end', () => {
        setTimeout(() => createBot(id), 15000);
    });
}

(async () => {
    await updateProxies();
    setInterval(updateProxies, 10 * 60 * 1000);

    for (let i = 0; i < BOT_COUNT; i++) {
        createBot(i);
        await new Promise(r => setTimeout(r, 6000)); // Большая задержка для Render
    }
})();
