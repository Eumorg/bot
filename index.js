const TelegramApi = require('node-telegram-bot-api')

const token = '5408753604:AAFD4CFICjgSm3Vk1WobiTHAuJuIwcQP2ug'

const bot = new TelegramApi(token, {polling: true})

const chats = {}

const againOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
    
      [{text: 'Play again', callback_data: '/again'}],
    ]
  })

}

const gameOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{text: '1', callback_data: '1'},{text: '2', callback_data: '2'},{text: '3', callback_data: '3'},],
      [{text: '4', callback_data: '4'},{text: '5', callback_data: '5'},{text: '6', callback_data: '6'},],
      [{text: '7', callback_data: '7'},{text: '8', callback_data: '8'},{text: '9', callback_data: '9'},],
      [{text: '0', callback_data: '0'}],
    ]
  })

}

const startGame =  async (chatId) => {
  await bot.sendMessage(chatId, "Guess the number")
  const randomNumber = Math.floor(Math.random() * 10)
  chats[chatId] = randomNumber
  await bot.sendMessage(chatId, 'Guess', gameOptions)
}


const start = () => {

  bot.setMyCommands([
    {command: '/start', description: 'Начальное приветствие'},
    {command: '/info', description: 'Getting users info'},
    {command: '/game', description: 'play a game'}
  ])
  
  
  bot.on('message', async msg => {
    const text = msg.text
    const chatId = msg.chat.id
    if(text === '/start'){
      return bot.sendMessage(chatId, "Welcome!")
    }
    if(text === '/info'){
      return bot.sendMessage(chatId, `Your name is ${msg.from.first_name}`)
    }
    if(text === '/game'){
      return startGame(chatId)
    }
    return bot.sendMessage(chatId, 'Can not understand')
  })

  bot.on('callback_query', async msg => {
    const data = msg.data
    const chatId = msg.message.chat.id
    if(data === '/again'){
      return startGame(chatId)
    }
    if(data === chats[chatId]){
      return bot.sendMessage(chatId, `You are rigth! The number is ${chats[chatId]}`, againOptions)
    }else{
      return bot.sendMessage(chatId, `You are wrong! The number is ${chats[chatId]}`, againOptions)
    }
 
  })

}

start()

