var request = require('request');
var Buffer = require('buffer').Buffer;
var qs = require('querystring');
var exec = require("child_process").exec;
var fs = require('fs');
var mongo_client = require("mongodb").MongoClient;
var path = require('path');
var logger = require("./logger").logger;

var doubi_rb = function(res, msg){
	if(!msg || !msg.Content){
		res.reply("给我点提示嘛，亲...");
	}
	var str = msg.Content;
    console.log(str)
	logger.debug("get str form doubi " + str);
	var data = {"chat": str};
	request.get({
        url: 'http://www.xiaodoubi.com/bot/api.php?' + qs.stringify(data),
        json: true
    }, function(error, response, body){
        if (!error && response.statusCode == 200) {
            logger.debug("get response doubi, resuest is " + str + " , and response is " + body);
            if(typeof(body) == 'object'){
            	res.reply({
			      title: body.title,
			      description: body.content
			    });
            }else if(typeof(body) == 'string'){
            	res.reply(body);
            }
        }
    });
};

var moli_rb = function(robot_config, res, str){
	logger.debug("get str form moli " + str);
	var data = {"question": str, "api_key": robot_config.app_id, "api_secret": robot_config.app_secret};
	request.get({
        url: 'http://i.itpk.cn/api.php?' + qs.stringify(data),
        json: true,
        encoding: 'utf8'
    }, function(error, response, body){
        if (!error && response.statusCode == 200) {
            logger.debug("get response moli, resuest is " + str + " , and response is " + body);
            if(typeof(body) == 'object'){
            	res.reply({
			      type: "text",
			      content: body.title + "\r\n\r\n" + body.content
			    });
            }else if(typeof(body) == 'string'){
            	res.reply(body);
            }
        }
    });
};

var common_rb = function(){
	  if (message.FromUserName === 'diaosi') {
    res.reply('hehe');
  } else if (message.FromUserName === 'text') {
    res.reply({
      content: 'text object',
      type: 'text'
    });
  } else if (message.FromUserName === 'hehe') {
    res.reply({
      type: "music",
      content: {
        title: "À´¶ÎÒôÀÖ°É",
        description: "Ò»ÎÞËùÓÐ",
        musicUrl: "http://mp3.com/xx.mp3",
        hqMusicUrl: "http://mp3.com/xx.mp3",
        thumbMediaId: "thisThumbMediaId"
      }
    });
  } else {
    res.reply([
      {
        title: "hi", 
        description: "hi, girl",
        picurl: 'http://nodeapi.cloudfoundry.com/qrcode.jpg',
        url: 'http://blog.liyanjie.top/2015/08/22/python%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83%E5%A4%87%E5%BF%98/'
      }
    ]);
  }
};

// 爬虫查询
var crawl_query = function(crawl_config, res, msg){
    var ar_province = ["上海", "江苏", "浙江", "安徽", "北京", "天津", 
        "广东", "河北", "河南", "山东", "湖北", "湖南", "江西", "福建", "四川",
        "重庆", "广西", "山西", "辽宁", "吉林", "黑龙江", "贵州", "陕西", "云南", 
        "内蒙古", "甘肃", "青海", "宁夏", "新疆", "海南", "西藏", "香港", "澳门", "台湾"];
    var mongo_url = "mongodb://" + crawl_config.user + ":" + crawl_config.password + "@" + crawl_config.host + ":" + crawl_config.port + "/" + crawl_config.db;
    mongo_client.connect(mongo_url, function(err, db){
        var message = "";
        if(err){
            logger.error("connect to mongo err" + err);
            res.reply("连接数据库出错");
            return;
        }
        if("详情" == msg || "group" == msg || "g" == msg){
            db.collection("corp").aggregate([{$group: {_id: "$province",total:{$sum:1}}},{$sort:{total: -1}}], function(err, data){
                var message = "";
                data.forEach(function(item, index){
                    message += "序号: " + (index + 1) +" ,省份: " + item._id + ", 数量: " + item.total + "\r\n";
                })
                res.reply(message);
            });
        }else if("总数" == msg || "sum" == msg || 's' == msg){
            db.collection("corp").count(function(err, data){
                res.reply("总数：" + data);
            })
        }else if(ar_province.indexOf(msg) >= 0){
            db.collection("corp").find({"province":msg}).count(function(err, data){
                res.reply(msg + "数量: " + data);
            });
        }else{
            var reg = new RegExp(msg);
            db.collection("corp").find({corp_name:reg},{corp_name:1,province:1,_id:0}).limit(5).toArray(function(err, data){
                var message = "";
                data.forEach(function(item, index){
                    message += "序号: " + (index + 1) +" ,省份: " + item.province + ", 名称: " + item.corp_name + "\r\n";
                })
                res.reply(message);
            });
        }
    });
};

exports.doubi_rb = doubi_rb;
exports.moli_rb = moli_rb;
exports.common_rb = common_rb;
exports.crawl_query = crawl_query;
