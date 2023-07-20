const { Bot, webhookCallback } = require("grammy");
const fetch = require("node-fetch");
const express = require("express");
require("dotenv").config();
const bot = new Bot(process.env.BOT_TOKEN);

// Command check prire Product
  bot.command('gia', async (ctx) => {
    const message = ctx.message;
    const url = message.text.split(' ')[1];
  
    if (!url) {
      ctx.reply('<b>Làm ơn thêm link địa chỉ sản phẩm sau câu lệnh</b> /gia ',{parse_mode: "HTML"});
      return;
    }
  
    try {
      const unixtime = Math.floor(Date.now())
      const apiURL = 'https://apiv3.beecost.vn/search/product?timestamp=' + unixtime + '&product_url=' + url
      const response = await fetch(apiURL, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        },
    });
      const res = await response.text();
      const obj = JSON.parse(res)
      const sts = obj.status
    if (sts === "success") {
      const items = obj.data.product_base.name
      const price = obj.data.product_base.price
      const strMess = items + "\nGiá: " + price
      ctx.reply(strMess,{parse_mode: "HTML"});
      await ctx.deleteMessage(message.message_id);

    } else {
      if (sts === "error" && obj.msg === "error when getting product detail") {
        await ctx.deleteMessage(message.message_id);
      ctx.reply(`Sản phẩm ${url} chưa có sự thay đổi giá nào!`);

      } else {
        await ctx.deleteMessage(message.message_id);
      ctx.reply(`Có vẻ như địa chỉ ${url} chưa đúng hoặc không phải link sản phẩm! Kiểm tra và thử lại nhé!`);
      }
      
    }
    } catch (error) {
      ctx.reply('Cảm ơn! Máy chủ gặp sự cố xin vui lòng thử lại!');
    }
  });
 
// // Description Commands
//   bot.api.setMyCommands([
//     { command: "gia ", description: "Tra lịch sử giá của sản phẩm" },
//     {
//       command: "live ",
//       description: "Thêm sản phâm vào giỏ live",
//     },
//   ]); 

  
// bot.command("gia", (ctx) => ctx.reply("Welcome! Up and running."));
// bot.on("message", (ctx) => ctx.reply("<b>Got another message!></b>",{
//     parse_mode: "HTML"}));

if (process.env.NODE_ENV === "production") {
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  bot.start();
}

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

