'use strict';

const Parser = require('rss-parser')
const retry = require('async-retry')
const fetch = require('node-fetch')
const parser = new Parser();

const discordWebhookToken = process.env.discordWebhookToken;
const rssFeedUUID = process.env.rssFeedUUID
const DiscordWebhookUrl = `https://discordapp.com/api/webhooks/${discordWebhookToken}`

module.exports.index = async (event, context, cb) => {
    const rssResponse = await retry(async (fn,i)=>{
        return await parser.parseURL(`https://mangadex.org/rss/follows/${rssFeedUUID}`);
    },{retries:5})
    const items = rssResponse.items;
    const nowDate = new Date();

    let i = 0
    let nextDate = new Date(items[i].isoDate)
    while (nowDate - nextDate <= 300000){ 
        // Post a record to Discord
        const discordNotifBody = {
            content: `New Release: ${items[i].title}`,
            embeds: [ {
                title: items[i].title,
                color: 65280,
                fields:[
                  {name: "Link", value: items[i].link},
                ],
                footer: {"text":nextDate.toDateString()}
            } ]
        }
          
        await fetch(DiscordWebhookUrl, {
            method: 'post',
            body:    JSON.stringify(discordNotifBody),
            headers: { 'Content-Type': 'application/json' }
        })

        i++; nextDate = new Date(items[i].isoDate);
    }
    
    cb(null, "Done");
}