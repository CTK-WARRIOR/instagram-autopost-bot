const axios = require("axios")
const cheerio = require("cheerio")
const jimp = require("jimp")
const { createCanvas, loadImage } = require("canvas")

async function getAnimeQuote() {
    const json = await axios(`https://animechan.vercel.app/api/random`)
        .then(res => res.data)
        .catch(err => { })

    return json;
}

async function getWallpaper(anime, character) {
    const images = []
    let url = null;

    let htmlData = await axios(`https://wall.alphacoders.com/search.php?search=${anime.split(" ").join("+")}`)
        .then(res => {
            url = res.request.res.responseUrl
            return res.data;
        }).catch(err => { })

    if (!url) return console.log("[ERROR]: Unable to get location url.")

    let $ = cheerio.load(htmlData)
    const pages = $('span.btn.btn-info.btn-lg').text()?.split("/")[1]
    if (!pages) {
        $('div.thumb-container-big').each(function (i, elem) {
            $ = cheerio.load($(elem).html())
            images.push({
                url: $('img').attr('src')?.replace("thumbbig-", ""),
                size: $('div.boxcaption div.thumb-info span').text()?.split("x")
            })

        })
        if (images.length) return images[Math.floor(Math.random() * images.length)];
        else return console.log("[ERROR]: Unable to get any image.")
    }

    htmlData = await axios(`${url}&page=${randomNumber(1, Number(pages))}`)
        .then(res => res.data)

    $ = cheerio.load(htmlData)
    $('div.thumb-container-big').each(function (i, elem) {
        $ = cheerio.load($(elem).html())
        images.push({
            url: $('img').attr('src')?.replace("thumbbig-", ""),
            size: $('div.boxcaption div.thumb-info span').text()?.split("x")
        })

    })

    return images[Math.floor(Math.random() * images.length)];
}

async function generateImage(img, quote) {
    const canvas = createCanvas(1080, 1080)
    const ctx = canvas.getContext('2d')
    let [x, y] = img.size;

    x = Number(x)
    y = Number(y)

    let scale = Math.max(canvas.width / x, canvas.height / y);
    let xx = (canvas.width / 2) - (x / 2) * scale;
    let yy = (canvas.height / 2) - (y / 2) * scale;

    ctx.drawImage(await loadImage(img.url), xx, yy, x * scale, y * scale);

    ctx.rect(0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "#000000"
    ctx.fill()
    ctx.globalAlpha = 1;

    ctx.font = `bold 20px soft`
    ctx.fillStyle = `#FFFFFF`
    ctx.textAlign = "end"
    ctx.fillText(`${quote.character} •`, 1050, 1050)
    ctx.textAlign = "start"
    ctx.fillText(`• ${quote.anime}`, 20, 50)


    ctx.font = `bold 40px soft`;
    const words = quote.quote.split(' ');
    drawWords(ctx, quote.quote, 50, 540 - ((words.length / 6) * 10), 1000, 40, 30, words)

    const image = await jimp.read(canvas.toBuffer())
    return image.write("image.jpg")
}


function drawWords(context, text, x, y, maxWidth, lineHeight, rectHeight, words) {
    var line = '';
    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
    rectHeight = rectHeight + lineHeight;
}

function randomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = { getAnimeQuote, getWallpaper, drawWords, generateImage }