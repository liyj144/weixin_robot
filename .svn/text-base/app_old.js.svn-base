var express = require("express");
var webot = require("weixin-robot");
var app = express();

webot.set("hi", "你好，小宝贝");
webot.set("subscribe", {
    pattern: function(info) {
    return info.is('event') && info.param.event === 'subscribe';
  },
  handler: function(info) {
    return '欢迎订阅小芳专属微信机器人';
  }
});

webot.set('test', {
  pattern: /^test/i,
  handler: function(info, next) {
    next(null, '就知道你在逗我，嘻嘻!')
  }
});

webot.watch(app, { token: 'e8550d38f57cb698cee1e7c6a0ef2892', path: '/wechat' });
var webot2 = new webot.Webot();
webot2.set({
  '/hi/i': 'Hello',
  '/who (are|r) (you|u)/i': 'I\'m a robot.'
});
webot2.watch(app, {
  token: 'token2',
  path: '/wechat_en', // 这个path不能为之前已经监听过的path的子目录
});

app.listen("8888");
