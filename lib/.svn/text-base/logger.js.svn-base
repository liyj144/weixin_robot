//log module
var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: './node_release.log', category: 'wechat' }
  ]
});
var logger = log4js.getLogger('wechat');
logger.setLevel('DEBUG');
exports.logger = logger;