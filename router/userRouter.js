var express = require('express');
var path = require("path");
const bodyParser = require('body-parser');
var queryString = require('querystring');
var http = require('http');
var UUID = require('uuid');
var request = require('request');
var htmlData = require('../view/HtmlData');
var gitLabConfig=require('../config/gitLabConfig.json');
var config = require('../comm/db.json');
var serverConfig=require('../config/serverHost.json');

var git_clientId = gitLabConfig.git_clientId;
var git_clientSecret = gitLabConfig.git_clientSecret;
var git_redirect_url = serverConfig.global_host+gitLabConfig.git_redirect_url;

//创建编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })
//获取路由实例
var router = express.Router();

var SqliteDB = require('../db/sqlite').SqliteDB;
var file = config["db_name"];
var sqliteDB = new SqliteDB(file);

router.post('/login', (req, res) => {
    let data = req.body
    var querySql = 'select login_name,password from user_login where login_name=? and password=? ';
    var params = [data.login_name, data.password];
    sqliteDB.queryOneData(querySql, params, function (err, data) {
        if (data) {
            //代表登录成功
            req.session.user = data.login_name;
            res.send(htmlData.indexHtml(data.login_name + "登录成功"))
        } else {
            //无用户，则需要重新登录
            var msg = '用户不存在或者密码错误';
            res.send(htmlData.loginHtml(msg))
        }
    })

})


router.post('/register', (req, res) => {
    let objData = req.body
    var ID = UUID.v1();
    insertLoginData = [ID, objData.login_name, objData.password];
    var insertLoginSql = 'insert into user_login(id, login_name, password) values(?, ?, ?)';
    sqliteDB.insertOneData(insertLoginSql, insertLoginData, function (err, result) {
        if (err) {
            if (err.errno == 19) {
                res.send(htmlData.registerHtml(objData.login_name + "用户名已存在", objData));
            } else {
                res.send({ "msg": "出错了", "desc": "请联系管理员" });
            }
        } else {
            insertInfoData = [ID, objData.user_name, objData.user_mobile, objData.user_email, objData.user_address];
            var insertinfoSql = 'insert into user_info(id, user_name, user_mobile,user_email,user_address) values(?, ?, ?, ?, ?)';
            sqliteDB.insertOneData(insertinfoSql, insertInfoData, function (err, result) {
                if (err) {
                    res.send({ "msg": "出错了", "desc": err });
                }
                res.send(htmlData.loginHtml(""));
            });
        }
    });
})


router.get('/list', function (req, res) {

    var selectSql = 'select u.id,u.login_name,u.password,i.user_name,i.user_mobile,i.user_email,i.user_address from user_login u left join user_info i on u.id=i.id';
    sqliteDB.queryData(selectSql, function (err, data) {
        if (err) {
            res.send({ "result": "查询失败了", "desc": err });
        }
        res.send(htmlData.listHtml(data))
    })
})


router.get('/delete', function (req, res) {
    let { id } = req.query
    var sql = 'delete from user_login where id=?';
    sqliteDB.deleteSqlById(sql, id, function (err, data) {
        if (err) {
            res.send('删除失败:' + err);
        } else {
            var userSql = 'delete from user_info where id=?';
            sqliteDB.deleteSqlById(sql, id, function (err, data) {
                if (err) {
                    res.send('删除失败了:' + err);
                } else {
                    res.redirect(global.host + "user/list");
                }
            })
        }
    });
})


router.get('/login/gitHubLogin', function (req, res) {
    //1、GitHub认证服务器地址
    var git_url = 'http://202.12.11.201/oauth/authorize';
    //var git_url = 'https://github.com/login/oauth/authorize';这个是gitHub的
    //生成并保存,此处用定值
    var git_state = '921921';
    //传递参数response_type、client_id、state、redirect_uri
    var git_param = 'response_type=code&' + 'client_id=' + git_clientId + '&state=' + git_state + '&redirect_uri=' + git_redirect_url;
    //使用重定向发送get请求
    res.redirect(git_url + '?' + git_param);
})

router.get('/login/oauth2/code', function (req, res) {
    let resData = req.query
    //1.验证state，如果不一致，又可能被CSRF攻击
    if (resData["state"] != '921921') {
        res.send('State验证失败');
    }
    //2、向GitHub认证服务器申请令牌,注意此处为POST请求
    //https://github.com/login/oauth/access_token
    request({
        url: 'http://202.11.11.201/oauth/token',
        method: 'POST',
        form: {
            "grant_type":"authorization_code",
            "code": resData["code"],
            "client_id": git_clientId,
            "client_secret": git_clientSecret,
            "redirect_uri": git_redirect_url,
            "state":'921921'
        }
    }, function (error, response, body1) {
        if (!error && response.statusCode == 200) {
            var tokenBody=JSON.parse(body1);
            //拿到了access_token,向资源服务器请求用户信息，携带access_token和tokenType
            //var  userUrl="https://api.github.com/user?access_token=" + accessToken + "&token_type=" + tokenType;
            var params="access_token=" + tokenBody.access_token + "&token_type=" + tokenBody.token_type;
            var userUrl = "http://202.11.11.201/api/v3/user?" + params;
            //申请用户资源
            request({
                url: userUrl,
                method:'GET'
                // headers: {
                //     'User_Agent': 'zhoudadozhou'
                // }
            }, function (error, response, resbody) {
                if (!error && response.statusCode == 200) {
                    var userBody=JSON.parse(resbody)
                    req.session.user=userBody.name
                    //获取用户信息成功
                    res.send(htmlData.indexHtml(userBody.name+"通过第三方登录成功，他的邮箱是:"+userBody.email));
                } else {
                    res.send("获取用户信息失败:" + response.statusCode+":"+response.statusMessage);
                }
            })
        } else {
            res.send("获取token失败:"+response.statusCode+":"+response.statusMessage)
        }


    })
})


router.get('/update', function (req, res) {
    let { id } = req.query
    if (id != null) {
        //查询信息，并且返回页面信息
        var selectSql = 'select u.id,u.login_name,u.password,i.user_name,i.user_mobile,i.user_email,i.user_address from user_login u left join user_info i on u.id=i.id where u.id=?';
        var params = [id];
        sqliteDB.queryOneData(selectSql, params, function (err, data) {
            if (err) {
                res.send('修改时的查询出错了:' + err);
            } else {
                //返回一个修改的页面
                res.send(htmlData.updateHtml(data));
            }
        })
    }

})

router.post('/update', function (req, res) {
    //拿取值
    let dataObj = req.body
    var params = [dataObj.login_name, dataObj.password, dataObj.id];
    var updateSql = 'update user_login set login_name=?,password=? where id=?';
    sqliteDB.executeSql(updateSql, params, function (err, data) {
        if (err) {
            res.send('更新失败了');
        }
        var params1 = [dataObj.user_name, dataObj.user_mobile, dataObj.user_email, dataObj.user_address, dataObj.id];
        var updateSql1 = 'update user_info set user_name=?,user_mobile=?,user_email=?,user_address=? where id=?';
        sqliteDB.executeSql(updateSql1, params1, function (err, data) {
            if (err) {
                res.send('更新失败了');
            }
            res.redirect(global.host + "user/list");
        });
    })
})


module.exports = router