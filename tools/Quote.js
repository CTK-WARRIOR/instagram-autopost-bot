const { getAnimeQuote, getWallpaper, generateImage } = require("./ImageGenerator.js")
const { registerFont } = require("canvas")
registerFont('./fonts/soft.ttf', { family: 'soft' })

class Quote {
    constructor({ tags, client, interval } = {}) {
        this.tags = tags
        this.client = client
        this.interval = interval
    }

    async run() {
        console.log("- Instagram Quote Bot is Started 🥳 - ")
        const that = this

        setInterval(async function () {
            const quote = await getAnimeQuote()

            await that.generateQuoteImage(quote).catch(err => {
                console.log(err)
             })

            setTimeout(async function () {
                const post = await that.postQuote(quote).catch(err => { })
                if (!post) return console.log("[ERROR]: Unable to post quote.")

                console.log(`[https://www.instagram.com/p/${post.media.code}]: Uploaded new post from ${quote.anime}`)
            }, 5000)
        }, this.interval)
    }

    async generateQuoteImage(quote) {
        const image = await getWallpaper(quote.anime)
        !image ? image = await getWallpaper(quote.character) : image
        if (!image) throw "Unable to generate image."

        return generateImage(image, quote)
    }

    async postQuote(quote) {
        const post = await this.client.uploadPhoto({
            photo: './image.jpg',
            caption: `"${quote.quote}"\n\n- ${quote.character} from ${quote.anime}\n\n\n#anime #${quote.anime.replace(/ /g, "")} ${this.tags}`,
            post: "feed"
        })

        return post;
    }
}

module.exports = Quote;