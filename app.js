var express = require("express");
var wechat = require('wechat');
var config = require('config');
var app = express();
var http = require('http').Server(app);
var API = require('wechat-api');
var robot = require('./lib/robot');

var menu_config = config.get('wx.wx_menu');
var app_id      = config.get('wx.app_id');
var token  = config.get('wx.token');
var app_secret  = config.get('wx.app_secret');
var encodingAESKey  = config.get('wx.encodingAESKey');

var wx_config = {
  token: token,
  appid: app_id,
  encodingAESKey: encodingAESKey
};

var api = new API(app_id, app_secret);
api.createMenu(menu_config, function(err, result){
  console.log(result);
});

app.use(express.query());
app.use('/wechat', wechat(wx_config, function (req, res, next) {
  var message = req.weixin;
   //console.log(req, message, message.FromUserName)
   process.nextTick(function(){
      robot.moli_rb(res, message);
   });
}));


http.listen(1234, function(){
    console.log('Server running at http://127.0.0.1:1234/');
});
