const WebSocket = require('ws');
const url = require('url');
const vertoken = require('./token/token')
const { server } = require('./server');
const { user } = require('./db.config');
const wsServer = new WebSocket.Server({
  server,
});
const userList = new Map()
exports.wsServer = wsServer;
wsServer.on('connection', (ws) => {
  ws.on('message',(mes) => {
    // console.log(JSON.parse(mes.toString()));
    let message = JSON.parse(mes.toString())
    // type = 0 用户登录储存用户信息
    if(message.type === 0) {
      console.log(message.user_account + '------已登录');
      userList.set(message.user_account, ws)
    } else {
      // type = 1 用户已登录发送聊天信息
      if(userList.get(message.sendTo) != undefined) {
        let returnData = {
          code: 1, //信息成功发送
          toYouUser: message.user_account,
          data: message.message
        }
        userList.get(message.sendTo).send(JSON.stringify(returnData))
      } else {
        // 如果没找到用户信息，说明想发送的用户未登录
        let returnData = {
          code: -1, //信息发送失败
          data: '用户未登录'
        }
        ws.send(JSON.stringify(returnData))
      }
    }
  })
  ws.on("close",(val) => {
    console.log('关闭');
  })
  ws.on('error', function (error) {
    console.log(error)
})
})