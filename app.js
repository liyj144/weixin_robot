var express = require("express");
var wechat = require('wechat');
var config = require('config');
var app = express();
var http = require('http').Server(app);
var API = require('wechat-api');
var session = require("express-session");
var cookieParser = require("cookie-parser");
var uuid = require('node-uuid');
var crypto = require("crypto");
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
    cookie: {maxAge: 240000 }, // 240s 生效时间
    name: "ROBOT_APP_ID",
    resave: false,
    saveUninitialized: true
}));
app.use(express.query());
app.use('/wechat', wechat(wx_config, function (req, res, next) {
    var userid = req.session.userid;
    if(!userid){
        req.session.userid = userid = crypto.createHash('md5').update(uuid.v1()).digest('hex');
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
        tuling_config['userid'] = userid;
        robot.tuling_rb(tuling_config, res, content);
      });
    }
    
}));
// for test
app.get('/crawl', function(req, res){
  process.nextTick(function(){
    var userid = req.session.userid;
    if(!userid){
        req.session.userid = userid = crypto.createHash('md5').update(uuid.v1()).digest('hex');
    }
    res.send(userid);
    //robot.crawl_query(crawl_config, res, req.query.q);
    //robot.tuling_rb(tuling_config, res, req.query.q, true);
    //robot.moli_rb(robot_config, res, req.query.q);
  })
});


http.listen(1234, function(){
    console.log('Server running at http://127.0.0.1:1234/');
});
