/** Common config for bookstore. */

require('dotenv').config()

const DB_URI = (process.env.NODE_ENV === "test")
  ? `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/bookstore_test` 
  : `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/bookstore`;


module.exports = { DB_URI };