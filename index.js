// Thu vien 
const { Bot, webhookCallback } = require("grammy");
const fetch = require("node-fetch");
const express = require("express");
require("dotenv").config();
const bot = new Bot(process.env.BOT_TOKEN);

// cau lenh
bot.on('message', async (ctx) => { 
  const message = ctx.message.text;
  const linkRegex = /(https?:\/\/[^\s]+)/;
  const lzd = /lazada/
  const lkol = /\.vn\/l./;
  const lkoc = /\?cc/;
  const pee = /https:\/\/sh/;
  const tiki = /https:\/\/ti/;
  
  if (linkRegex.test(message)) {
    const url = message.match(linkRegex)[0]
    if (!lkol.test(url) && !lkoc.test(url) && !lzd.test(url) && !pee.test(url) && !tiki.test(url)) {
      await ctx.deleteMessage(message.message_id);
      return next()
    }
    if (lzd.test(url)){ 
    await ctx.deleteMessage(message.message_id);
  const reslzd = await fetch(url)
  const resURL = await reslzd.text()
  const checkURL = (/₫ (.*?)Mua/g ).test(resURL)
// Laz chuẩn  
    if (!lkol.test(url) && !lkoc.test(url) && checkURL == true){ 
      // if (checkURL == true) {
      ctx.reply("link chuẩn")
      let retryCount = 0;
      const maxRetries = 3;
      while (retryCount < maxRetries) {
      try { 
      const unixtime = Math.floor(Date.now())
      const apiURL = await `https://apiv3.beecost.vn/search/product?timestamp=${unixtime}&product_url=${url}`
      const response = await fetch(apiURL, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer {token}',
        },
    });
      const res = await response.text(); 
      const obj = await JSON.parse(res)
      const sts =  obj.status
      if (sts === "error") {ctx.reply(`Sản phẩm ${url} chưa có bất kì biến động giá nào!`)}
      if (sts === "success") {
        const avr = obj.data.product_base.price_insight.avg_price
// Kiem tra bien dong gia buoc 1
      if (avr == "-1"){
          ctx.reply(`Sản phẩm ${url} chưa có bất kì biến động giá nào!`)
        } else {
          const curpri = resURL.match(/₫ (.*?)Mua/g )[0].replace(/₫ /g, "")
          .replace(/Mua/g, "")
          .replace(/\./g,"")
          const name = resURL.match(/<title>(.*?)<\/title>/g)[0].replace(/title/g, "")
          .replace(/</g, "")
          .replace(/>/g,"")
          .replace(/\//g,"")
          const baseID = obj.data.product_base.product_base_id         
// Fetch get history price
        const hisPri = await `https://apiv3.beecost.vn/product/history_price?product_base_id=${baseID}&price_current=${curpri}`
        console.log(hisPri)
        const response1 = await fetch(hisPri, {
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer {token}',
        },
        });
        const res1 = await response1.text();
        const obj1 = await JSON.parse(res1)
        // const min = obj1.data.product_history_data.price_classification.min_price
        // const rate = obj1.data.product_history_data.price_classification.classify_price
        const rate = obj1.data.product_history_data.auto_content.review_price.sentences[2]
        const avr = obj1.data.product_history_data.price_classification.avg_price
        const max = obj1.data.product_history_data.price_classification.max_price
        const timestamps = obj1.data.product_history_data.item_history.price_ts
        const priItem = obj1.data.product_history_data.item_history.price
        console.log(priItem.length)
        const formattedNumbers = priItem.map(number => (number / 1000));
        const formattedDates = timestamps.map(epochToDDMMYY);
        const minValue = Math.min(...priItem)
        const minIndex = priItem.indexOf(minValue);
        const chart = await quickChart(formattedDates, minIndex, formattedNumbers, minValue.toLocaleString('de-DE'), avr.toLocaleString('de-DE') , max.toLocaleString('de-DE'))
       
        const strMess = `<i><a href="${url}">${name}</a></i>\n<b>${rate}</b>`
        await ctx.replyWithPhoto(chart,{caption: strMess, parse_mode: "HTML"});

        }
      }
      break;
    } catch (err) {
      console.log(err)
      retryCount++;
    }
  }
    if (retryCount === maxRetries) {
      ctx.reply("Máy chủ gặp sự cố trong quá trình truy xuất, hãy thử lại nhé!")
      // Handle the case when the maximum number of retries is reached
    }
  } else {
    if (!lkol.test(url) && !lkoc.test(url) && !lzd.test(url) && checkURL == false) {
    ctx.reply(`Opps! Có vẻ như ${url} không phải link sản phẩm! Vui lòng kiểm tra lại nhé!`)
    return next()
    }
    ctx.reply("link aff")
    let retryCount = 0;
    const maxRetries = 3;
    while (retryCount < maxRetries) {
    try {
      const unixtime = Math.floor(Date.now())
      const apiURL = `https://apiv3.beecost.vn/search/product?timestamp=${unixtime}&product_url=${url}`
      const response = await fetch(apiURL, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer {token}',
        },
    });
      const res = await response.text(); 
      const obj = await JSON.parse(res)
      const sts =  obj.status
      
      if (sts === "error" && obj.msg === "product url is not valid") {
        ctx.reply(`Opps! Có vẻ như ${url} không phải link sản phẩm! Vui lòng kiểm tra lại nhé!`)
      } else {
        if (sts === "error") {
          ctx.reply(`Sản phẩm ${url} chưa có bất kì biến động giá nào!`)
        }}

      if (sts === "success") {
        const avr1 = obj.data.product_base.price_insight.avg_price
        if (avr1 == "-1"){
          ctx.reply(`Sản phẩm ${url} chưa có bất kì biến động giá nào!`)
          return next()
        }
        const name = obj.data.product_base.name
        const baseID = obj.data.product_base.product_base_id
        const price = obj.data.product_base.price
  // Fetch get history price
        const hisPri = await `https://apiv3.beecost.vn/product/history_price?product_base_id=${baseID}&price_current=${price}`
        console.log(hisPri)
        const response1 = await fetch(hisPri, {
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer {token}',
        },
        });
        const res1 = await response1.text();
        const obj1 = await JSON.parse(res1)
        // const min = obj1.data.product_history_data.price_classification.min_price
        // const rate = obj1.data.product_history_data.price_classification.classify_price
        const rate = obj1.data.product_history_data.auto_content.review_price.sentences[2]
        const avr = obj1.data.product_history_data.price_classification.avg_price
        const max = obj1.data.product_history_data.price_classification.max_price
        const timestamps = obj1.data.product_history_data.item_history.price_ts
        const priItem = obj1.data.product_history_data.item_history.price
        const formattedNumbers = priItem.map(number => (number / 1000));
        const formattedDates = timestamps.map(epochToDDMMYY);
        const minValue = Math.min(...priItem)
        const minIndex = priItem.indexOf(minValue);
        const chart = await quickChart(formattedDates, minIndex, formattedNumbers, minValue.toLocaleString('de-DE'), avr.toLocaleString('de-DE') , max.toLocaleString('de-DE'))

        const strMess = `<i><a href="${url}">${name}</a></i>\n<b>${rate}</b>`

        await ctx.replyWithPhoto(chart,{caption: strMess, parse_mode: "HTML"});
      }
      break;
    } catch (errr) {
      console.log(errr)
      retryCount++;
    }
  }
    if (retryCount === maxRetries) {
      ctx.reply("Máy chủ gặp sự cố trong quá trình truy xuất, hãy thử lại nhé!")
      // Handle the case when the maximum number of retries is reached
    }
  }
    } else {
      if (pee.test(url)){
        await ctx.deleteMessage(message.message_id); 
// PEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
      let retryCount = 0;
      const maxRetries = 3;
      while (retryCount < maxRetries) {
        try {
        const respee = await fetch(url)
        const resURL = await respee.url
        const unixtime = Math.floor(Date.now())
      const apiURL = `https://apiv3.beecost.vn/search/product?timestamp=${unixtime}&product_url=${resURL}`
      const response = await fetch(apiURL, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer {token}',
        },
    });
      const res = await response.text(); 
      const obj = await JSON.parse(res)
      const sts =  obj.status
      
      if (sts === "error" && obj.msg === "product url is not valid") {
        ctx.reply(`Opps! Có vẻ như ${url} không phải link sản phẩm! Vui lòng kiểm tra lại nhé!`)
      } else {
        if (sts === "error") {
          ctx.reply(`Sản phẩm ${url} chưa có bất kì biến động giá nào!`)
        }}

      if (sts === "success") {
        const avr1 = obj.data.product_base.price_insight.avg_price
        if (avr1 == "-1"){
          ctx.reply(`Sản phẩm ${url} chưa có bất kì biến động giá nào!`)
          return next()
        }
        const name = obj.data.product_base.name
        const baseID = obj.data.product_base.product_base_id
        const price = obj.data.product_base.price
  // Fetch get history price
        const hisPri = await `https://apiv3.beecost.vn/product/history_price?product_base_id=${baseID}&price_current=${price}`
        console.log(hisPri)
        const response1 = await fetch(hisPri, {
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer {token}',
        },
        });
        const res1 = await response1.text();
        const obj1 = await JSON.parse(res1)
        // const min = obj1.data.product_history_data.price_classification.min_price
        // const rate = obj1.data.product_history_data.price_classification.classify_price
        const rate = obj1.data.product_history_data.auto_content.review_price.sentences[2]
        const avr = obj1.data.product_history_data.price_classification.avg_price
        const max = obj1.data.product_history_data.price_classification.max_price
        const timestamps = obj1.data.product_history_data.item_history.price_ts
        const priItem = obj1.data.product_history_data.item_history.price
        const formattedNumbers = priItem.map(number => (number / 1000));
        const formattedDates = timestamps.map(epochToDDMMYY);
        console.log(formattedDates.length)
        const minValue = Math.min(...priItem)
        const minIndex = priItem.indexOf(minValue);
        const chart = await quickChart(formattedDates, minIndex, formattedNumbers, minValue.toLocaleString('de-DE'), avr.toLocaleString('de-DE') , max.toLocaleString('de-DE'))

        const strMess = `<i><a href="${url}">${name}</a></i>\n<b>${rate}</b>`

        await ctx.replyWithPhoto(chart,{caption: strMess, parse_mode: "HTML"});
      }
        break;
        } catch (ers) {
          console.log(ers)
          retryCount++;
        }
      }
        if (retryCount === maxRetries) {
          ctx.reply("Máy chủ gặp sự cố trong quá trình truy xuất, hãy thử lại nhé!")
          // Handle the case when the maximum number of retries is reached
        }
      } else {
      if (tiki.test(url)) {
        await ctx.deleteMessage(message.message_id);
        ctx.reply("Sàn TIKI Đang cập nhật trong thời gian tới!")
      }
    }
    }
    
  }

  return next();
}

  
// Moi truong lam viec
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




 // Convert epoch to DD/MM/YY format
function epochToDDMMYY(epoch) {
  const date = new Date(epoch);
  const options = { day: '2-digit', month: '2-digit', year: '2-digit' };
  return date.toLocaleDateString('en-GB', options);
}

// quickchart
function quickChart(time, posi, price, min, avr , max) {
const chart = {
  type: 'line',
  data: {
    labels: time,
    datasets: [{
      label: 'Có Nên Chốt Đơn X SaleLaMeOfficial',
      data: price,
      fill: false,
      borderColor: 'green',
      backgroundColor: 'green',
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    title: {
      display: true,
      text: `Thấp Nhất: ${min} ₫            Trung Bình: ${avr} ₫             Cao Nhất: ${max} ₫`,
    },
    annotation: {
      annotations: [{
        type: 'line',
        mode: 'vertical',
        scaleID: 'x-axis-0',
        value: posi,
        borderColor: 'red',
        borderWidth: 2,
        label: {
          enabled: true,
          content: 'Min',
          position: 'bottom'
        }
      }, {
        type: 'box',
        xScaleID: 'x-axis-0',
        yScaleID: 'y-axis-0',
        backgroundColor: 'rgba(200, 200, 200, 0.2)',
        borderColor: '#ccc',
      }]
    },
    scales: {
      xAxes: [{ 
          offset: true,
          ticks: {
            autoSkip: true
          }
		  }],
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
		  },
    plugins: {
      datalabels: {
        display: true,
        align: 'bottom',
        backgroundColor: '#ccc',
        borderRadius: 30,
        borderWidth: 0,
        padding: 0,
      },
    }
  }
}
  const chartUrl = `https://quickchart.io/chart?&c=${encodeURIComponent(JSON.stringify(chart))}`;
return chartUrl
}
