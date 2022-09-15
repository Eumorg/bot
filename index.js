const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');


const TelegramApi = require("node-telegram-bot-api");

const sequelize = require('./db')



// const { User } = require('./db/models');

// const User = require('./db/models/')

require('dotenv').config();

const weather = require("weather-js");

const token = "5408753604:AAFD4CFICjgSm3Vk1WobiTHAuJuIwcQP2ug";

const bot = new TelegramApi(token, { polling: true });

const chats = {};

const againOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [[{ text: "Play again", callback_data: "/again" }]],
  }),
};

const gameOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "Погода в Канаде", callback_data: "1" }],
      [{ text: "Хочу почитать!", callback_data: "2" }],
      [{ text: "Сделать рассылку", callback_data: "3" }],
    ],
  }),
};

const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    "Здравствуйте. Нажмите на любую интересующую Вас кнопку",
    gameOptions
  );
};

const start = async() => {
  try {
    await sequelize.authenticate()
    await sequelize.sync()
  } catch (error) {
    console.log(error)
    
  }
  bot.setMyCommands([
    { command: "/start", description: "Начало работы" },
    // {command: '/info', description: 'Getting users info'},
    // {command: '/game', description: 'play a game'}
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    if (text === "/start") {
      try {
        await User.create({
          userName: 'Biba',
          chatId: 'ddd'
        })
      } catch (error) {
        console.log(error)
      }
      
      return startGame(chatId);
    }
    // if(text === '/info'){
    //   return bot.sendMessage(chatId, `Your name is ${msg.from.first_name}`)
    // }
    // if(text === '/game'){
    //   return startGame(chatId)
    // }
    return bot.sendMessage(chatId, "Can not understand");
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    console.log(data);
    const chatId = msg.message.chat.id;
    if (data == 1) {
      weather.find(
        { search: "Toronto, ON", degreeType: "C" },
        function (err, result) {
          if (err) console.log(err);

          // result = JSON.stringify(result, null, 2);
          let temp = result[0].current.temperature;

          return bot.sendMessage(
            chatId,
            `Температура в Торонто, Канада ${temp} C`
          );
        }
      );
    }

    if (data == 2) {
      await bot.sendPhoto(
        chatId,
        "https://pythonist.ru/wp-content/uploads/2020/03/photo_2021-02-03_10-47-04-350x2000-1.jpg",
        {
          caption:
            "Идеальный карманный справочник для быстрого ознакомления с особенностями работы разработчиков на Python. Вы найдете море краткой информации о типах и операторах в Python, именах специальных методов, встроенных функциях, исключениях и других часто используемых стандартных модулях.",
        }
      );
      return bot.sendDocument(
        chatId,
        `https://drive.google.com/u/0/uc?id=1Xs_YjOLgigsuKl17mOnR_488MdEKloCD&export=download`
      );
    }
  });
};

start();

const port = process.env.PORT || 3100;
app.listen(port, () => {
  console.log('\x1b[33m', `Server started at http://localhost:${port}`);
});
