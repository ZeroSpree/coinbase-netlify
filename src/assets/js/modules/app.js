const axios = require("axios");
const refreshRate = 1000 * 1000;
const alertAudio = new Audio('./assets/audio/alert.wav');

window.vm = new Vue({
  el: '#app',

  data: {
    "coins": [],
    "whitelist": {},
    "alerts": true,
    "alarm_active": false
  },

  filters: {
    number: function (value) {
      var truncated = Math.floor(value * 100000) / 100000;
      return parseFloat(truncated.toFixed(5));
    },

    percent: function (value) {
      var val = value * 100;
      var truncated = Math.floor(val * 100) / 100;
      return parseFloat(truncated.toFixed(2));
    }
  },

  methods: {
    checkAlarm: function () {
      if(!vm.alerts) return false;

      for (var coin in vm.coins) {
        var symbol = vm.coins[coin].symbol;
        var price = Number(vm.coins[coin]['latest']);
        var price_lt = Number(vm.whitelist[symbol].price_lt);
        var price_gt = Number(vm.whitelist[symbol].price_gt);

        console.log(price, price_lt, price_gt);

        var lt = price_lt && price <= price_lt;
        var gt = price_gt && price >= price_gt;

        Vue.set(vm.coins[coin], 'alert_lt', lt);
        Vue.set(vm.coins[coin], 'alert_gt', gt);

        if (lt || gt) {
          alertAudio.play();
          vm.alarm_active = true;
        }
      }
    },

    // Updates URL, for sharing purposes
    updateurl: function () {
      var params = '#pairs=';

      for (var symbol in vm.whitelist) {
        var price_lt = vm.whitelist[symbol]['price_lt'];
        var price_gt = vm.whitelist[symbol]['price_gt'];

        if (price_lt || price_gt) params += symbol + ',' + (price_lt || '') + ',' + (price_gt || '') + '|';
      }

      if(params == '#pairs=') history.pushState(null, null, '/');
      else {
        params = params.slice(0, -1); // remove last pipe
        history.pushState(null, null, params);
      }
      vm.checkAlarm();
    },

    /**
     * Set lt and gt prices from URL query
     * /?pairs=btc,1,2|ada,,2
     * this sets btc lt=1, gt=2 and ada gt=2
     */
    process_params: function () {
      var hash = window.location.hash;

      if (!hash.length) return false;
      var pairs = window.location.hash.substr(1).split('=')[1].split('|');

      for (var p in pairs) {
        var t = pairs[p].split(',');
        var coin = t[0].toUpperCase();
        var price_lt = t[1];
        var price_gt = t[2];

        if (vm.whitelist[coin]) {
          if (price_lt) vm.whitelist[coin]['price_lt'] = price_lt;
          if (price_gt) vm.whitelist[coin]['price_gt'] = price_gt;
        }
      }
    },

    get_whitelist: function () {
      axios.get('whitelist.json').then((response) => {
        Vue.set(vm, 'whitelist', response.data);
        vm.process_params();
        vm.get_data();
      });
    },

    get_data: function () {
      const url = "https://www.coinbase.com/api/v2/assets/search?base=USD&country=USA&filter=listed&include_prices=true&limit=200&order=asc&page=1&query=&resolution=hour&sort=rank";

      axios.get(url).then((response) => {
        let d = response.data.data;
        let keeplist = [];

        // Keep only whitelisted items (USDT PAIRS)
        for (let k in d) vm.whitelist[d[k].symbol] && keeplist.push(d[k]);

        Vue.set(vm, 'coins', keeplist);
        vm.alarm_active = false;
        vm.checkAlarm();
      });
    },
  },

  mounted: function () {
    this.$nextTick(function () {
      this.get_whitelist();
      setInterval(vm.get_data, refreshRate);
    });
  }
});
