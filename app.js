var express = require("express");
var wechat = require('wechat');
var config = require('config');
var app = express();
var http = require('http').Server(app);
var API = require('wechat-api');
var session = require("express-session");
var cookieParser = require("cookie-parser");
var uuid = require('node-uuid');
var robot = require('./lib/robot');

var menu_config = config.get('wx.wx_menu');
var app_id      = config.get('wx.app_id');
var token  = config.get('wx.token');
var app_secret  = config.get('wx.app_secret');
var robot_config = config.get("robot");
var crawl_config = config.get("scrapy_mongo");
var tuling_config = config.get("tuling_config");
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

// session
app.use(session({
    secret: "12345",
    name: "ROBOT_APP_ID",
    resave: false,
    saveUninitialized: true
}));
app.use(express.query());
app.use('/wechat', wechat(wx_config, function (req, res, next) {
    var uuid = req.session.uuid;
    if(!uuid){
        uuid = uuid.v1();
    }
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
        tuling_config['uuid'] = uuid;
        robot.tuling_rb(tuling_config, res, content);
      });
    }
    
}));
// for test
app.get('/crawl', function(req, res){
  process.nextTick(function(){
    //robot.crawl_query(crawl_config, res, req.query.q);
    robot.tuling_rb(tuling_config, res, req.query.q, true);
    //robot.moli_rb(robot_config, res, req.query.q);
  })
});


http.listen(1234, function(){
    console.log('Server running at http://127.0.0.1:1234/');
});
