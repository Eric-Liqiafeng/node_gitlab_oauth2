let HtmlData=require('../view/HtmlData')

/**
 * 中间件作用，为了拦截请求，除了/和/user/login/和/user/register的除外，其余都需要在登录之后进行操作
 */
module.exports = function log(req,res,next){
    if(req.url=='/'){
        res.send(HtmlData.loginHtml(""));
     }else if(req.url=='/user/login' && req.method=='GET'){
        res.send(HtmlData.loginHtml(""));
     }else if(req.url=='/user/register' && req.method=='GET'){
        var obj = { "login_name": "", "password": "", "user_name": "", "user_address": "", "user_email": "", "user_mobile": "" }
        res.send(HtmlData.registerHtml("",obj));
     }else{
        var reg=new RegExp('/user/login/*');
         if(req.session.user || (req.url=='/user/register' && req.method=='POST') || reg.test(req.url)){
              next()  
         }else{
            res.send(HtmlData.loginHtml("请先登录"));
         }
     }
     
}


