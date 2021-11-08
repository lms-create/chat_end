const WebSocket = require('ws');
const url = require('url');
const vertoken = require('./token/token')
const { server } = require('./server');
const { user } = require('./db.config');
const db = require('./db')
const { type } = require('os');
const wsServer = new WebSocket.Server({
  server,
});
const userList = new Map()
exports.wsServer = wsServer;
wsServer.on('connection', (ws) => {
  ws.on('message',(mes) => {
    console.log(JSON.parse(mes.toString()));
    let message = JSON.parse(mes.toString())
    // 处理客户端传过来的信息
    coreLogic(message,ws);
  })
  ws.on("close",(val) => {
    console.log('关闭');
  })
  ws.on('error', function (error) {
    console.log(error)
})
})

function seeUserNum() {
  console.log(`----目前在线用户(${userList.size})--`);
      for(const k of userList.keys()){
        console.log(k);
      }
      console.log('---------------------');
}

function coreLogic(message,user_ws) {
  // type = 0 用户登录储存用户信息
  if(message.type === 0) {
    console.log(message.user_account + '------已登录');
    updateMysql(message.user_account, 1)
    userList.set(message.user_account, user_ws)
    seeUserNum()
  } else if(message.type === 1) {
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
        data: '你想发送给的用户未登录'
      }
      user_ws.send(JSON.stringify(returnData))
    }
  } else if(message.type === -1) {
    // type = -1 用户下线
    console.log('用户下线');
    userList.delete(message.user_account)
    updateMysql(message.user_account,-1)
    seeUserNum()
  } else {
    console.log('其他');
  }
}

function updateMysql(account,status) {
  console.log(account,status);
  let sql = `UPDATE users SET user_status=${status} WHERE user_account='${account}'`
  console.log(sql);
  db.query(sql)
}