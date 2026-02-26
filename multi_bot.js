const mineflayer = require('mineflayer');
const armorManager = require('mineflayer-armor-manager');
const { plugin: pvp } = require('mineflayer-pvp');

// ========== НАСТРОЙКИ ==========
const CONFIG = {
  host: 'localhost',       // <-- поменяй на свой сервер
  port: 25565,
  password: 'test12345',
  botCount: 10,
  version: false           // авто-определение версии
};

// Имена ботов
function botName(id) {
  return `PvPBot_${id}`;
}

// ========== СОЗДАНИЕ БОТА ==========
function createPvPBot(id) {
  const username = botName(id);

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: username,
    version: CONFIG.version,
    hideErrors: true
  });

  // Подключаем плагины
  bot.loadPlugin(pvp);
  bot.loadPlugin(armorManager);

  // ----- ЭТАП 1: Логин и вход на сервер -----
  bot.once('spawn', () => {
    console.log(`[+] ${username} зашёл на сервер`);

    setTimeout(() => {
      bot.chat(`/reg ${CONFIG.password} ${CONFIG.password}`);
      bot.chat(`/login ${CONFIG.password}`);
    }, 2000);

    setTimeout(() => {
      bot.chat('/s4');
      console.log(`[>] ${username} прожал /s4`);
    }, 5000);

    // Через 7 секунд — одеваемся и начинаем
    setTimeout(() => {
      equipFullArmor(bot, username);
    }, 7000);

    // Через 12 секунд — вызов на PvP и начало боя
    setTimeout(() => {
      startPvPRoutine(bot, username);
    }, 12000);
  });

  // ----- ЭТАП 2: Экипировка брони из инвентаря -----
  function equipFullArmor(bot, name) {
    console.log(`[🛡] ${name} одевает броню...`);

    const slots = {
      head: 5,      // слот головы
      torso: 6,     // слот нагрудника
      legs: 7,      // слот поножей
      feet: 8       // слот ботинок
    };

    const armorTypes = {
      head: ['helmet'],
      torso: ['chestplate'],
      legs: ['leggings'],
      feet: ['boots']
    };

    // Проходим по инвентарю и одеваем броню
    for (const [slotName, keywords] of Object.entries(armorTypes)) {
      const item = bot.inventory.items().find(item =>
        keywords.some(kw => item.name.toLowerCase().includes(kw))
      );

      if (item) {
        bot.equip(item, slotName)
          .then(() => console.log(`  [✓] ${name}: надел ${item.name}`))
          .catch(() => console.log(`  [x] ${name}: не удалось надеть ${item.name}`));
      }
    }

    // Берём меч или топор в руку
    setTimeout(() => {
      equipWeapon(bot, name);
    }, 1500);
  }

  function equipWeapon(bot, name) {
    const weapon = bot.inventory.items().find(item =>
      item.name.includes('sword') || item.name.includes('axe')
    );

    if (weapon) {
      bot.equip(weapon, 'hand')
        .then(() => console.log(`  [⚔] ${name}: взял ${weapon.name}`))
        .catch(() => {});
    }
  }

  // ----- ЭТАП 3: PvP логика -----
  function startPvPRoutine(bot, name) {
    // Пишем вызов в чат
    bot.chat('Кто PvP? Выходи, сольём!');

    // Цикл поиска и атаки ближайшего игрока
    setInterval(() => {
      findAndAttack(bot, name);
    }, 1000);

    // Периодически подбираем выпавшие вещи и переодеваемся
    setInterval(() => {
      equipFullArmor(bot, name);
    }, 30000);
  }

  function findAndAttack(bot, name) {
    // Ищем ближайшего игрока (не бота из нашей группы)
    const target = bot.nearestEntity(entity => {
      if (entity.type !== 'player') return false;
      if (!entity.username) return false;
      // Не атакуем своих ботов
      if (entity.username.startsWith('PvPBot_')) return false;
      return true;
    });

    if (target) {
      // Расстояние до цели
      const dist = bot.entity.position.distanceTo(target.position);

      if (dist < 4) {
        // Ближний бой — бьём без пощады
        bot.pvp.attack(target);
      } else if (dist < 30) {
        // Подходим ближе
        bot.pvp.attack(target);
      }
    } else {
      // Никого нет — бродим
      bot.pvp.stop();
      randomWalk(bot);
    }
  }

  // Случайное перемещение когда нет цели
  function randomWalk(bot) {
    const directions = ['forward', 'back', 'left', 'right'];
    const dir = directions[Math.floor(Math.random() * directions.length)];

    bot.setControlState(dir, true);
    setTimeout(() => {
      bot.setControlState(dir, false);
    }, 600);
  }

  // ----- ЭТАП 4: Умный бой -----
  // Прыжок-крит при атаке
  bot.on('physicsTick', () => {
    if (bot.pvp.target) {
      // Крит-хит: прыгаем перед ударом
      if (bot.entity.onGround) {
        bot.setControlState('jump', true);
      } else {
        bot.setControlState('jump', false);
      }

      // Спринт для доп. урона
      bot.setControlState('sprint', true);
    }
  });

  // Еда при низком здоровье
  bot.on('health', () => {
    if (bot.health < 10) {
      eatFood(bot, name);
    }

    // Переодеваем броню если слетела
    if (bot.health < 15) {
      equipFullArmor(bot, name);
    }
  });

  function eatFood(bot, name) {
    const food = bot.inventory.items().find(item =>
      item.name.includes('apple') ||
      item.name.includes('bread') ||
      item.name.includes('steak') ||
      item.name.includes('carrot') ||
      item.name.includes('potato')
    );

    if (food) {
      bot.equip(food, 'hand')
        .then(() => bot.consume())
        .then(() => console.log(`  [♥] ${name}: поел ${food.name}`))
        .catch(() => {});
    }
  }

  // ----- ЭТАП 5: Щит-блок -----
  bot.on('entitySwingArm', (entity) => {
    if (!entity || entity.type !== 'player') return;
    if (!bot.pvp.target) return;

    const dist = bot.entity.position.distanceTo(entity.position);
    if (dist < 5) {
      // Блокируем щитом если есть
      const shield = bot.inventory.items().find(i => i.name.includes('shield'));
      if (shield) {
        bot.equip(shield, 'off-hand').catch(() => {});
        bot.activateItem(true); // поднимаем щит
        setTimeout(() => {
          bot.deactivateItem(); // опускаем
        }, 500);
      }
    }
  });

  // ----- Реконнект при кике -----
  bot.on('kicked', (reason) => {
    console.log(`[-] ${username} кикнут: ${reason}`);
    setTimeout(() => createPvPBot(id), 15000);
  });

  bot.on('error', (err) => {
    console.log(`[!] ${username} ошибка: ${err.message}`);
  });

  bot.on('end', () => {
    console.log(`[x] ${username} отключён. Реконнект...`);
    setTimeout(() => createPvPBot(id), 15000);
  });

  return bot;
}

// ========== ЗАПУСК ==========
console.log('=================================');
console.log('   PvP Боты — Запуск');
console.log(`   Ботов: ${CONFIG.botCount}`);
console.log(`   Сервер: ${CONFIG.host}:${CONFIG.port}`);
console.log('=================================');

for (let i = 0; i < CONFIG.botCount; i++) {
  setTimeout(() => {
    createPvPBot(i);
  }, i * 4000); // 4 секунды между ботами
}
