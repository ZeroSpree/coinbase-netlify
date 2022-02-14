const axios = require("axios");
const fs = require('fs');

// Retrieve all coinbase pairs so we can later filter out USDT pairs only
(async function () {
  async function getPairs() {
    return axios({
      method: "get",
      url: "https://api.pro.coinbase.com/products"
    }).then(res => res.data);
  }

  const pairs = await getPairs();
  let whitelist = {};

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    if (pair.quote_currency === 'USDT' && !pair.fx_stablecoin) {
      whitelist[pair.base_currency] = {};
    }
  }

  fs.writeFile(
    './dist/whitelist.json',
    JSON.stringify(whitelist),
    function (err) {
      if (err) return console.log(err);
      else console.log('>>>>>>>> CB DATA RESPONSE OK');
    });
})();
