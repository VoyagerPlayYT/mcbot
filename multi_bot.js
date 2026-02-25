const mineflayer = require('mineflayer');
const ProxyAgent = require('proxy-agent');
const axios = require('axios');

const HOST = 'mc.mineblaze.ru';
const VERSION = '1.16.5';
const BOT_COUNT = 100;

let proxyList = [];

// Функция загрузки бесплатных прокси
async function updateProxies() {
    try {
        console.log('--- Загрузка списка прокси... ---');
        // Берем прокси из открытого источника (SOCKS5 и HTTP)
        const response = await axios.get('https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all');
        proxyList = response.data.split('\r\n').filter(p => p.length > 0);
        console.log(`--- Загружено ${proxyList.length} прокси ---`);
    } catch (err) {
        console.log('Ошибка загрузки прокси, пробуем зайти напрямую...');
    }
}

function generateName() {
    const prefixes = ['Andrey', 'Sasha', 'Dima', 'Pro', 'Mega', 'Top', 'Killer'];
    const suffix = Math.floor(Math.random() * 900000);
    return (prefixes[Math.floor(Math.random() * prefixes.length)] + suffix).substring(0, 16);
}

async function createBot(id) {
    // Берем случайную проксю из списка
    const proxyRaw = proxyList[Math.floor(Math.random() * proxyList.length)];
    const proxyUrl = proxyRaw ? `http://${proxyRaw}` : null;

    const bot = mineflayer.createBot({
        host: HOST,
        username: generateName(),
        version: VERSION,
        agent: proxyUrl ? new ProxyAgent(proxyUrl) : null,
        connectTimeout: 15000
    });

    bot.once('spawn', async () => {
        console.log(`[${bot.username}] Прорвался через прокси ${proxyRaw || 'Direct'}`);
        
        await new Promise(r => setTimeout(r, 3000));
        bot.chat('/reg 12345678 12345678');
        
        await new Promise(r => setTimeout(r, 5000));
        bot.chat('/s1');

        // Цикл спама
        setInterval(() => {
            if (bot.entity) {
                bot.chat('тест тест тест тест');
            }
        }, 5000 + (Math.random() * 3000));
    });

    // Если прокся плохая или кикнули — берем новую и перезаходим
    bot.on('error', () => {}); 
    bot.on('end', () => {
        setTimeout(() => createBot(id), 10000);
    });
}

// Главная функция
(async () => {
    await updateProxies();
    
    // Обновляем список прокси каждые 15 минут
    setInterval(updateProxies, 15 * 60 * 1000);

    for (let i = 0; i < BOT_COUNT; i++) {
        createBot(i);
        // Задержка между попытками захода
        await new Promise(r => setTimeout(r, 5000));
    }
})();
