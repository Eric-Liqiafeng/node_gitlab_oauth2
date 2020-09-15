const express = require('express');
const http = require('http');
const app = express();
const bodyPaser = require('body-parser');
var path = require("path");
var session = require('express-session');
var interceptMw=require('./middlewares/interceptMw');
var serverHostConfig=require('./config/serverHost.json');

app.use(session({
    secret: 'sessiontest',//与cookieParser一致
    resave: true,
    saveUninitialized: true
}))

app.use(bodyPaser.urlencoded({ extended: false }))
app.use(bodyPaser.json())

//允许跨域
app.all('*', function (req, res, next) {
    //console.log(req.ip);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    if (req.method == "OPTIONS") res.send(200);/*让options请求快速返回*/
    else next();
});

//使用中间件，将其余的请求直接通过
app.use(interceptMw)

//将user用户的路由引入
let userRouter = require('./router/userRouter');

app.use('/user', userRouter, function (req, res) {
    
})

app.listen(8081, () => {
    console.log('server start.....'+serverHostConfig.global_host);
    //设置全局的启动IP和端口，这样同一个局域网可以正常访问
    global.host = serverHostConfig.global_host;

})
