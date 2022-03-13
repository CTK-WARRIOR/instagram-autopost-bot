const Instagram = require('instagram-web-api')
const Quote = require('./tools/Quote')

const FileCookieStore = require('tough-cookie-filestore2')
const cookieStore = new FileCookieStore('./cookies.json')

const { username, password, tags } = require("./config.json")

const client = new Instagram({ username, password, cookieStore })
const instaQuote = new Quote({ client, tags, interval: 1000 * 60 * 60 * 12 })

client.login().then(async () => {
    console.log("Connected to the instagram :)")
    await instaQuote.run()
})
