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
var robot_config = config.get("robot");
var crawl_config = config.get("scrapy_mongo");
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
    if(!message || !message.Content){
      res.reply("给我点提示嘛，亲...");
    }
    var content = message.Content;
    if(content.indexOf("s") == 0){
      content = content.substr(1);
      process.nextTick(function(){
        robot.crawl_query(crawl_config, res, content);
      });
    }else{
      process.nextTick(function(){
        robot.moli_rb(robot_config, res, message);
      });
    }
    
}));
// for test
app.get('/crawl', function(req, res){
  process.nextTick(function(){
    //robot.crawl_query(crawl_config, res, req.query.q);
    robot.moli_rb(robot_config, res, req.query.q);
  })
});


http.listen(1234, function(){
    console.log('Server running at http://127.0.0.1:1234/');
});
