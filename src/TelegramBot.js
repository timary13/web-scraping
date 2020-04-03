require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const getAudits = require('./scraping');

class Bot {
    constructor() {
        this.token = process.env.TOKEN;
        this.CHAT_ID = process.env.CHAT_ID;
        this.audits = [];

        this.startMenu = {
            title: 'Choose options:',
            buttons: [
                [{text: 'Check available audits', callback_data: 'check'}],
                [{text: 'Check request in work', callback_data: 'work'}],
            ]
        };
        this.answerCallback = this.answerCallback.bind(this);

        this.start();
    }

    start() {
        this.instance = new TelegramBot(this.token, {polling: true});

        this.instance.onText(/\/start/, (msg) => {
            this.setStartMenu(msg);
        });

        this.instance.on("polling_error", (err) => console.log(err));

        this.instance.on('callback_query', this.answerCallback);
    }

    answerCallback(msg) {
        const answer = msg.data;

        if (answer === 'check') {
            this.getAuditNames(msg);
            // this.instance.sendMessage(msg.from.id, 'CHECK');
        } else if (answer === 'work') {
            this.instance.sendMessage(msg.from.id, 'WORK ❌');
        }

        // this.instance.answerCallbackQuery(msg.id, 'Вы выбрали: '+ msg.data, true);
    }

    setStartMenu(msg) {
        const text = this.startMenu.title;
        const options = {
            reply_markup: JSON.stringify({
                inline_keyboard: this.startMenu.buttons,
                parse_mode: 'HTML'
            })
        };
        const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
        this.instance.sendMessage(chat, text, options);
    }

    getAuditNames(msg) {
        this.auditMenu = {};
        this.audits = getAudits('tr[onclick]')
            .then((res) => {
                console.log(res);

                this.auditMenu = {
                    title: 'Choose audit:',
                    buttons: res.map(function (audit) {
                        const name = audit.innerText;
                        // const className = audit.getAttribute('onclick').name;
                        return [{text: name, callback_data: name}];
                    })
                };

                console.log('auditMenu');
                console.log(this.auditMenu);
            })
            .then(() => {
                this.setAuditNamesMenu(msg);
            });
    }

    setAuditNamesMenu(msg) {
        const text = this.auditMenu.title;
        const options = {
            reply_markup: JSON.stringify({
                inline_keyboard: this.auditMenu.buttons,
                parse_mode: 'HTML'
            })
        };
        const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
        this.instance.sendMessage(chat, text, options);
    }

    // setStartMenuAnswer(msg) {
    //     const answer = msg.callback_data;
    //     console.log('answer=' + answer);
    //
    //     if (answer === 'check') {
    //         this.instance.sendMessage(msg.from.id, 'CHECK ✅');
    //     } else if(answer === 'work'){
    //         this.instance.sendMessage(msg.from.id, 'WORK ❌');
    //     }
    //
    //     this.instance.answerCallbackQuery(msg.id, 'Вы выбрали: '+ msg.data, true);
    // }

    // sendToBot(nickname, msg) {
    //     const reply = `${nickname}: ${msg.slice(5)}`;
    //     this.instance.sendMessage(this.CHAT_ID, reply);
    //     return reply;
    // }
}

module.exports = Bot;