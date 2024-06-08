// Thu vien ab
const { Bot, webhookCallback } = require("grammy");
const fetch = require("node-fetch");
const express = require("express");
require("dotenv").config();
const bot = new Bot(process.env.BOT_TOKEN);

// huong dan
bot.command('start', async (ctx) => {
  const chatId = ctx.message.chat.id
  if (chatId != "-1001959268889") {
    ctx.replyWithPhoto("https://ibb.co/6NCCXYc", {caption: `<i><b>Để sử dụng được công cụ - Bạn làm theo các bước sau đây!</b></i>
    \n<b>Bước 1:</b> Tìm đến trang sản phẩm bạn muốn truy vấn.
    \n<b>Bước 2:</b> Nhấn nút chia sẻ sản phẩm (như hình) và copy link chia sẻ sản phẩm.
    \n<b>Bước 3:</b> Tham gia group https://t.me/CoNenChotDon và paste link sản phẩm vô Check Giá Sản Phẩm, rồi ấn Gửi.
    \n<b>Bước 4:</b> Chờ đợi kết quả từ phía máy chủ và xem xét giá sản phẩm!`, parse_mode: "HTML"})
  } 
});

// cau lenh
bot.on('message', async (ctx, next) => {
	//break;
  const chatId = ctx.message.chat.id
  const threadID = ctx.message.message_thread_id	
  const fromID = ctx.message.from.id
  const lastName = (ctx.message.from.last_name == undefined) ? "":ctx.message.from.last_name;
  const fullName = `${ctx.message.from.first_name} ${lastName}`
  // const messID = ctx.message.message_id
  console.log(chatId + " - " + fromID) 
  const tagName = `<a href="tg://user?id=${fromID}">${fullName}</a>`
  if (chatId == "5229925261" || chatId == "-1001959268889" && threadID == "1465") {
    //ctx.reply("link chuẩn")
  const message = ctx.message.text;
  const linkRegex = /(https?:\/\/[^\s]+)/;
  const lzd = /lazada/
  const lkol = /\.vn\/l./;
  const lkoc = /\?cc/;
  const pee = /https:\/\/sh/;
  const tiki = /https:\/\/ti/;
  const peeV = /https:\/\/vn\.sh/;
  const peeS = /https:\/\/s\.sh/;	  
  
  if (linkRegex.test(message)) {
    const url = message.match(linkRegex)[0].replace(/https:\/\/vn\.sh/, "https://sh").replace(/https:\/\/s\.shopee\.vn/, "https://shope.ee") 
	  console.log(url)
    if (!lkol.test(url) && !lkoc.test(url) && !lzd.test(url) && !pee.test(url) && !tiki.test(url)) {
     //await ctx.deleteMessage(message.message_id);
      return next()
    }
    if (lzd.test(url)){ 
    // await ctx.deleteMessage(message.message_id);
  const reslzd = await fetch(url)
  const resURL = await reslzd.text()
  const checkURL = (/₫ (.*?)Mua/g ).test(resURL)
// Laz chuẩn  
    if (!lkol.test(url) && !lkoc.test(url) && checkURL == true){ 
      // if (checkURL == true) {
    //   ctx.reply("link chuẩn")
      let retryCount = 0;
      const maxRetries = 5;
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
      console.log("suc11111111111111")
      const sts =  obj.status
      if (sts === "error") {ctx.reply(`<a href="${url}">Sản phẩm</a> chưa có bất kì biến động giá nào! ${tagName}`,{message_thread_id: threadID, parse_mode: "HTML"})
			    return next()
      }
      if (sts === "success") {
        const avr = obj?.data?.product_base?.price_insight?.avg_price ?? '0';
// Kiem tra bien dong gia buoc 1
      if (avr == "-1"){
        ctx.reply(`<a href="${url}">Sản phẩm</a> chưa có bất kì biến động giá nào! ${tagName}`,{message_thread_id: threadID, parse_mode: "HTML"})
	      return next()
        } else {
          const curpri = resURL.match(/₫ (.*?)Mua/g )[0].replace(/₫ /g, "")
          .replace(/Mua/g, "")
          .replace(/\./g,"")
          const name = resURL.match(/<title>(.*?)<\/title>/g)[0].replace(/title/g, "")
          .replace(/</g, "")
          .replace(/>/g,"")
          .replace(/\//g,"")
          const dLink = resURL.match(/href="(.*?)\?/)[1]
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
        console.log("suc222222222222222")
        // const min = obj1.data.product_history_data.price_classification.min_price
        // const rate = obj1.data.product_history_data.price_classification.classify_price
        const rate = obj1.data.product_history_data.auto_content.review_price.sentences[2]
        // const avr = obj1.data.product_history_data.price_classification.avg_price
        // const max = obj1.data.product_history_data.price_classification.max_price
        const timestamps = obj1.data.product_history_data.item_history.price_ts
        const priItem = obj1.data.product_history_data.item_history.price
        const avr = avrPri(priItem)
        const max = Math.max(...priItem)
        console.log(priItem.length)
        const count = priItem.length
        const formattedNumbers = priItem.map(number => (number / 1000));
        const formattedDates = timestamps.map(epochToDDMMYY);
        const minValue = Math.min(...priItem)
        const minIndex = priItem.indexOf(minValue);
        const chart = await quickChart(formattedDates, minIndex, formattedNumbers, minValue.toLocaleString('de-DE'), avr.toLocaleString('de-DE') , max.toLocaleString('de-DE'), count)
       
        const strMess = `<i><a href="${dLink}">${name}</a></i>\n<b>${rate}</b> ${tagName}`
        //\n﹏﹏﹏﹏﹏\n@CoNenChotDon
        await ctx.replyWithPhoto(chart,{caption: strMess, message_thread_id: threadID, reply_markup: {
          inline_keyboard: [
            /* Inline buttons. 2 side-by-side */
	            [ { text: "💯 Mã Giảm Giá", url: "https://s.lazada.vn/l.FT5H?" }, { text: "🤝 (+1) Hữu Ích", url: "https://s.lazada.vn/l.GRJZ?laz" }],

            /* One button */
            //[ { text: "❓Hướng Dẫn", url: "https://t.me/ChotDonBot" }, { text: "🔥 15 Voucher 50K", url: "https://www.facebook.com/groups/salelameofficial/"}]
        ]
      }
 , parse_mode: "HTML"});
        }
      }
      break;
    } catch (err) {
      console.log(err)
      retryCount++;
    }
  }
    if (retryCount === maxRetries) {
      ctx.reply(`Máy chủ gặp sự cố trong quá trình truy xuất, hãy thử lại nhé! ${tagName}`,{message_thread_id: threadID, parse_mode: "HTML"})
      // Handle the case when the maximum number of retries is reached
    }
  } else {
    const reslzd = await fetch(url)
    const resURL = await reslzd.url
    console.log(resURL)
    const dLink = await getDlink(resURL)
    //console.log(dLink)
    if (!lkol.test(url) && !lkoc.test(url) && !lzd.test(url) && checkURL == false) {
    ctx.reply(`Opps! Có vẻ như đây không phải link sản phẩm! Vui lòng kiểm tra lại nhé! ${tagName}`,{message_thread_id: threadID, parse_mode: "HTML"} )
    return next()
    }
    // ctx.reply("link aff")
    let retryCount = 0;
    const maxRetries = 5;
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
      console.log("suc1111111111111111111111111")
      if (sts === "error" && obj.msg === "product url is not valid") {
        ctx.reply(`Opps! Có vẻ như đây không phải link sản phẩm! Vui lòng kiểm tra lại nhé! ${tagName}`,{message_thread_id: threadID, parse_mode: "HTML"} )
        //await ctx.deleteMessage(message.message_id)
      } else {
        if (sts === "error") {
          ctx.reply(`<a href="${dLink}">Sản phẩm</a> chưa có bất kì biến động giá nào! ${tagName}`,{message_thread_id: threadID, parse_mode: "HTML"})
          //await ctx.deleteMessage(message.message_id)
		return next()
        }}

      if (sts === "success") {
        const avr1 = obj?.data?.product_base?.price_insight?.avg_price ?? '0';
        if (avr1 == "-1"){
          ctx.reply(`<a href="${dLink}">Sản phẩm</a> chưa có bất kì biến động giá nào! ${tagName}`,{message_thread_id: threadID, parse_mode: "HTML"})
          //await ctx.deleteMessage(message.message_id)
          //return next()
        }
        const namej = obj.data.product_base.name
        const name = namej.replace(/</g, "")
          .replace(/>/g,"")
          .replace(/\//g,"") 
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
        console.log("suc222222222222222")
        // const min = obj1.data.product_history_data.price_classification.min_price
        // const rate = obj1.data.product_history_data.price_classification.classify_price
        const rate = obj1.data.product_history_data.auto_content.review_price.sentences[2]
        // const avr = obj1.data.product_history_data.price_classification.avg_price
        // const max = obj1.data.product_history_data.price_classification.max_price
        const timestamps = obj1.data.product_history_data.item_history.price_ts
        const priItem = obj1.data.product_history_data.item_history.price
        const avr = avrPri(priItem)
        const max = Math.max(...priItem)
        const count = priItem.length
        const formattedNumbers = priItem.map(number => (number / 1000));
        const formattedDates = timestamps.map(epochToDDMMYY);
        const minValue = Math.min(...priItem)
        const minIndex = priItem.indexOf(minValue);
        const chart = await quickChart(formattedDates, minIndex, formattedNumbers, minValue.toLocaleString('de-DE'), avr.toLocaleString('de-DE') , max.toLocaleString('de-DE'), count)

        const strMess = `<i><a href="${dLink}">${name}</a></i>\n<b>${rate}</b> ${tagName}`
        // \n﹏﹏﹏﹏﹏\n@CoNenChotDon
        await ctx.replyWithPhoto(chart,{caption: strMess, message_thread_id: threadID, reply_markup: {
          inline_keyboard: [
            /* Inline buttons. 2 side-by-side */
            [ { text: "💯 Mã Giảm Giá", url: "https://s.lazada.vn/l.FT5H?" }, { text: "🤝 (+1) Hữu Ích", url: "https://s.lazada.vn/l.GRJZ?laz" }],

            /* One button */
            //[ { text: "❓Hướng Dẫn", url: "https://t.me/ChotDonBot" }, { text: "🔥 15 Voucher 50K", url: "https://www.facebook.com/groups/salelameofficial/"}]
        ]
      }
 , parse_mode: "HTML"});
      // await ctx.deleteMessage(message.message_id); 
      }
      break;
    } catch (errr) {
      console.log(errr)
      retryCount++;
    }
  }
    if (retryCount === maxRetries) {
      ctx.reply(`Máy chủ gặp sự cố trong quá trình truy xuất, hãy thử lại nhé! ${tagName}`,{message_thread_id: threadID, parse_mode: "HTML"} )
      //await ctx.deleteMessage(message.message_id)
      // Handle the case when the maximum number of retries is reached
    }
  }
    
    } else {
      if (pee.test(url) || peeV.test(url) || peeS.test(url)){
	      console.log("PEEEEEEEEEEEE")
        // await ctx.deleteMessage(message.message_id); 
// PEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
      let retryCount = 0;
      const maxRetries = 5;
      while (retryCount < maxRetries) {
        try {	
        const respee = await fetch(url)
        const resURL = await decodeURIComponent(respee.url.replace(/https:\/\/shopee\.vn\/universal-link\?af=false&deep_and_deferred=1&redir=/gm,''))
        const peeDlink = resURL.match(/(.*?)\?/)[1]
        console.log(peeDlink)
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
        ctx.reply(`Opps! Có vẻ như đây không phải link sản phẩm! Vui lòng kiểm tra lại nhé! ${tagName}`,{message_thread_id: threadID, parse_mode: "HTML"} )
      } else {
        if (sts === "error") {
          ctx.reply(`Sản phẩm ${peeDlink} chưa có bất kì biến động giá nào! ${tagName}`,{message_thread_id: threadID, parse_mode: "HTML"} )
        }}

      if (sts === "success") {
        const avr1 = obj?.data?.product_base?.price_insight?.avg_price ?? '0';
        if (avr1 == "-1"){
          ctx.reply(`Sản phẩm ${peeDlink} chưa có bất kì biến động giá nào! ${tagName}`,{message_thread_id: threadID, parse_mode: "HTML"} )
          //return next()
        }
        const namej = obj.data.product_base.name
        const name = namej.replace(/</g, "")
          .replace(/>/g,"")
          .replace(/\//g,"")
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
        // const avr = obj1.data.product_history_data.price_classification.avg_price
        // const max = obj1.data.product_history_data.price_classification.max_price
        const timestamps = obj1.data.product_history_data.item_history.price_ts
        const priItem = obj1.data.product_history_data.item_history.price
        const avr = avrPri(priItem)
        const max = Math.max(...priItem)
        const count = priItem.length
        const formattedNumbers = priItem.map(number => (number / 1000));
        const formattedDates = timestamps.map(epochToDDMMYY);
        const minValue = Math.min(...priItem)
        const minIndex = priItem.indexOf(minValue);
        const chart = await quickChart(formattedDates, minIndex, formattedNumbers, minValue.toLocaleString('de-DE'), avr.toLocaleString('de-DE') , max.toLocaleString('de-DE'), count)

        const strMess = `<i><a href="${peeDlink}">${name}</a></i>\n<b>${rate}</b> ${tagName}`
        //\n﹏﹏﹏﹏﹏\n@CoNenChotDon
        await ctx.replyWithPhoto(chart,{caption: strMess, message_thread_id: threadID, reply_markup: {
          inline_keyboard: [
            /* Inline buttons. 2 side-by-side */
            [ { text: "💯 Add Live 💯", url: "https://t.me/CoNenChotDon/55823" }, { text: "💯 Add Video 💯", url: "https://t.me/CoNenChotDon/55267" }],

            /* One button */
            //[ { text: "❓Hướng Dẫn", url: "https://t.me/ChotDonBot" }, { text: "🔥 15 Voucher 50K", url: "https://www.facebook.com/groups/salelameofficial/"}]
        ]
      }
 , parse_mode: "HTML"});
      }
        break;
        } catch (ers) {
          console.log(ers)
          retryCount++;
        }
      }
        if (retryCount === maxRetries) {
          ctx.reply(`Máy chủ gặp sự cố trong quá trình truy xuất, hãy thử lại nhé! ${tagName}`,{message_thread_id: threadID, parse_mode: "HTML"} )
          // Handle the case when the maximum number of retries is reached
          //await ctx.deleteMessage(message.message_id); 
        }
        
      } else {
      if (tiki.test(url)) {
        // await ctx.deleteMessage(message.message_id);
        ctx.reply(`Hiện tại chưa hỗ trợ nền tảng Tiki! ${tagName}`, {message_thread_id: threadID, parse_mode: "HTML"})
      }
    }
    }
    
  }

  return next();
}})

function avrPri(numbers) {
// Calculate the sum of all numbers
const sum = numbers.reduce((acc, curr) => acc + curr, 0);

// Calculate the average value
const average = sum / numbers.length;
return average
}

// Get full link 
function getDlink(dsl) {
  if (dsl.match(/(.*?)\?/) != null ) {
    console.log("haha")
    return dsl.match(/(.*?)\?/)[1]
  } else {
    return dsl
  }
}

// Convert epoch to DD/MM/YY format
function epochToDDMMYY(epoch) {
  const date = new Date(epoch);
  const options = { day: '2-digit', month: '2-digit', year: '2-digit' };
  return date.toLocaleDateString('en-GB', options);
}

// quickchart
function quickChart(time, posi, price, min, avr , max, count) {
const limit = (count > 30) ? false:true;
const chart = {
  type: 'line',
  data: {
    labels: time,
    datasets: [{
      label: 'Có Nên Chốt Đơn X SHOPEE ALIVE',
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
        display: limit,
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


// bot.use(linkAddressMiddleware)
  
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

