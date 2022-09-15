const express = require("express");
const app = express();
require("dotenv").config();

const TelegramApi = require("node-telegram-bot-api");

const { User } = require("./db/models");

const weather = require("weather-js");

const token = "5408753604:AAFD4CFICjgSm3Vk1WobiTHAuJuIwcQP2ug";

const bot = new TelegramApi(token, { polling: true });

const gameOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "Погода в Канаде", callback_data: "1" }],
      [{ text: "Хочу почитать!", callback_data: "2" }],
      [{ text: "Сделать рассылку", callback_data: "3" }],
    ],
  }),
};

const sendOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "Уверен", callback_data: "4" }],
      [{ text: "Отмена", callback_data: "5" }],
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

const start = async () => {
  bot.setMyCommands([{ command: "/start", description: "Начало работы" }]);

  bot.on("message", async (msg) => {
    const text = msg.text;

    const userName = msg.chat.username;
    const chatId = String(msg.chat.id);
    if (text === "/start") {
      try {
        await User.findOrCreate({
          where: {
            userName: userName,
            chatId: chatId,
          },
        });
      } catch (error) {
        console.log(error);
      }

      return startGame(chatId);
    }
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;

    const chatId = msg.message.chat.id;
    if (data == 1) {
      weather.find(
        { search: "Toronto, ON", degreeType: "C" },
        async function (err, result) {
          if (err) console.log(err);

          let temp = result[0].current.temperature;

          await bot.sendMessage(
            chatId,
            `Температура в Торонто, Канада ${temp} C`
          );
          return bot.sendMessage(
            chatId,
            "Нажмите на любую интересующую Вас кнопку",
            gameOptions
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
      await bot.sendDocument(
        chatId,
        `https://drive.google.com/u/0/uc?id=1Xs_YjOLgigsuKl17mOnR_488MdEKloCD&export=download`
      );
      return bot.sendMessage(
        chatId,
        "Нажмите на любую интересующую Вас кнопку",
        gameOptions
      );
    }
    if (data == 3) {
      return bot.sendMessage(
        chatId,
        "Вы выбрали рассылку всем пользователям. Вы уверен что хотите это сделать?",
        sendOptions
      );
    }
    if (data == 4) {
      bot.sendMessage(
        chatId,
        "Введите сообщение, которое хотите отправить всем пользователям."
      );
      bot.on("message", async (msg) => {
        try {
          const text = msg.text;
          ids = await User.findAll({ raw: true });
          ids = ids.map((el) => el.chatId);

          for (let i = 0; i < ids.length; i++) {
            bot.sendMessage(ids[i], text);
            return bot.sendMessage(
              chatId,
              "Рассылка завершена! Нажмите на любую интересующую Вас кнопку",
              gameOptions
            );
          }
        } catch (error) {
          console.log("Ошибка рассылки", error);
        }
      });
    }
    if (data == 5) {
      return bot.sendMessage(
        chatId,
        "Нажмите на любую интересующую Вас кнопку",
        gameOptions
      );
    }
  });
};

start();

const port = process.env.PORT || 3100;
app.listen(port, () => {
  console.log("\x1b[33m", `Server started at http://localhost:${port}`);
});
