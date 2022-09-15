const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
  'bot',
  'eumorg',
  '6931',
  {
    host: "127.0.0.1",
    port: '5432',
    dialect: 'postgres'
  }
)
