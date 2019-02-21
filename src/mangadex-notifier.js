'use strict';

const Parser = require('rss-parser')
const fetch = require('node-fetch')
const parser = new Parser();

const discordWebhookToken = process.env.discordWebhookToken;
const DiscordWebhookUrl = `https://discordapp.com/api/webhooks/${discordWebhookToken}`

module.exports.index = async (event, context, cb) => {
    const items = (await parser.parseURL('https://mangadex.org/rss/follows/xre5ZKW7GvT98ykAQNDUYhHmcqdFXEwz')).items;
    const nowDate = new Date();

    let i = 0
    let nextDate = new Date(items[i].isoDate)
    console.log(nowDate-nextDate)
    while (nowDate - nextDate <= 300000){ 
        // Post a record to Discord
        const discordNotifBody = {
            content: 'MangaDex New Release',
            embeds: [ {
                title: items[i].title,
                color: 65280,
                fields:[
                  {name: "Link", value: items[i].link},
                ],
                footer: {"text":nextDate.toDateString()}
            } ]
        }
          
        const discordNotif = await fetch(DiscordWebhookUrl, {
            method: 'post',
            body:    JSON.stringify(discordNotifBody),
            headers: { 'Content-Type': 'application/json' }
        })
        console.log(discordNotif);

        i++; nextDate = new Date(items[i].isoDate);
    }
    
    cb(null, "Done");
}