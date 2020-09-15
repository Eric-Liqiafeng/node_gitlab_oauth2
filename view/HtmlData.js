
let loginHtml = function (msg) {
    return `<html>
        <head>
            <meta charset="UTF-8">
            <title></title>
        </head>
        <body>
            <form action="${global.host}user/login" method="POST">
                   <p>
                       登录名:<input type="text" name="login_name" required>
                   </p>
                   <p>
                       密码:<input type="password" name="password" required>
                   </p>
                   <font color='red'>${msg}</font>
                   <p>
                       <input type="submit" value="登录">
                   </p>
                   <p>
                   <a href="${global.host}user/register">注册</a>
                   <a href="${global.host}user/login/gitHubLogin">GitLab登录接口</a>
                   </p>
            </form>
        </body>
    </html>`;
}

let registerHtml = function (msg, obj) {
    return `<html>
        <head>
            <meta charset="UTF-8">
            <title></title>
        </head>
        <body>
            <form action="${global.host}user/register" method="POST">
                   <p>
                       登录名:<input type="text" name="login_name" required value=${obj.login_name}><font color='red'>${msg}</font>
                   </p>
                   <p>
                       姓名:<input type="text" name="user_name" required value=${obj.user_name}>
                   </p>
                   <p>
                       电话:<input type="tel" name="user_mobile" value=${obj.user_mobile}>
                   </p>
                   <p>
                       邮箱:<input type="email" name="user_email" required value=${obj.user_email}>
                   </p>
                   <p>
                       住址:<input type="text" name="user_address" value=${obj.user_address}>
                </p>
                   <p>
                       密码:<input type="password" name="password" required value=${obj.password}>
                   </p>
                   <p>
                       <input type="submit" value="注册"><a href="${global.host}user/login">登录</a>
                   </p>
            </form>
        </body>
    </html>`;
}


let listHtml = function (data) {
    var listhtml = `<html><body><ul>`;
    data.forEach(element => {
        listhtml += `<li><label><font color='red'>登录名:</font>${element.login_name}</label>&nbsp;&nbsp;<label><font color='red'>用户名:</font>${element.user_name}</label>&nbsp;&nbsp;<label><font color='red'>用户电话:</font>${element.user_mobile}</label>
            &nbsp;&nbsp;<label><font color='red'>用户邮件:</font>${element.user_email}</label>&nbsp;&nbsp;<label><font color='red'>用户地址:</font>${element.user_address}</label><a href="${global.host}user/delete?id=${element.id}">删除用户</a>&nbsp;&nbsp;<a href="${global.host}user/update?id=${element.id}">修改</a></li>`;
    });
    listhtml += `</ul></body></html>`;
    return listhtml;
}

let updateHtml = function (data) {
    var html = `<html><body><form action="${global.host}user/update" method="POST">
    <p style="display:none" ><input type="text" name="id" value=${data.id}></p>
    <p>登录名:<input type="text" name="login_name" required value=${data.login_name}></p>
    <p>姓名:<input type="text" name="user_name" required value=${data.user_name}></p>
    <p>电话:<input type="tel" name="user_mobile" value=${data.user_mobile}></p>
    <p>邮箱:<input type="email" name="user_email" required value=${data.user_email}></p>
    <p>住址:<input type="text" name="user_address" value=${data.user_address}></p>
    <p>密码:<input type="password" name="password" required value=${data.password}></p>
    <input type="submit" value="提交修改">
    </form></body></html>`;
    return html;
}

let indexHtml=function (userData) {
    var html=`<html><body><font color='red' font-size='8px'>${userData}</font>
    <br/>
    <br/>
    <br/>
    <form action="${global.host}user/list" method="GET">
    <input type="submit" value="查询所有用户">
    </form></body></html>`;
    return html;
  }

module.exports = {
    loginHtml: loginHtml,
    registerHtml: registerHtml,
    listHtml: listHtml,
    updateHtml: updateHtml,
    indexHtml:indexHtml
}