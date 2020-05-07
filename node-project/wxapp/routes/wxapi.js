const express = require('express')
const router = express.Router()
const request = require('request')
const xmlreader = require('xmlreader')
const wxpay = require('./utils')

var appid = ''
var appsecret = ''
var mchid = ''
var mchkey = ''
var wxurl = ''

router.post('/wxpay', (req, res) => {
  let orderCode = req.body.orderCode
  let money = req.body.money
  let orderID = req.body.orderID
  let openID = req.body.openID
  console.log(
    'APP传过来的参数是',
    orderCode +
      '----' +
      money +
      '------' +
      orderID +
      '----' +
      appid +
      '-----' +
      appsecret +
      '-----' +
      mchid +
      '-----' +
      mchkey
  )

  // 首先生成签名
  let mch_id = mchid
  let nonce_str = wxpay.createNonceStr()
  let timestamp = wxpay.createTimeStamp()
  let body = '微信支付测试'
  let out_trade_no = orderCode
  let total_fee = wxpay.getmoney(money)
  let spbill_create_ip = req.connection.remoteAddress
  let notify_url = wxurl
  let trade_type = 'JSAPI'

  let sign = wxpay.paysignjsapi(
    appid,
    body,
    mch_id,
    nonce_str,
    notify_url,
    openID,
    out_trade_no,
    spbill_create_ip,
    total_fee,
    trade_type,
    mchkey
  )

  //组装xml数据
  var formData = '<xml>'
  formData += '<appid>' + appid + '</appid>' //appid
  formData += '<body><![CDATA[' + '测试微信支付' + ']]></body>'
  formData += '<mch_id>' + mch_id + '</mch_id>' //商户号
  formData += '<nonce_str>' + nonce_str + '</nonce_str>' //随机字符串，不长于32位。
  formData += '<notify_url>' + notify_url + '</notify_url>'
  formData += '<openid>' + openid + '</openid>'
  formData += '<out_trade_no>' + out_trade_no + '</out_trade_no>'
  formData += '<spbill_create_ip>' + spbill_create_ip + '</spbill_create_ip>'
  formData += '<total_fee>' + total_fee + '</total_fee>'
  formData += '<trade_type>' + trade_type + '</trade_type>'
  formData += '<sign>' + sign + '</sign>'
  formData += '</xml>'

  var url = 'https://api.mch.wexin.qq.com/pay/unifiedorder'

  request({ url: url, method: 'POST', body: formData }, function(
    err,
    response,
    body
  ) {
    if (!err && response.statusCode == 200) {
      console.log(body)

      xmlreader.read(body.toString('utf-8'), function(errors, response) {
        if (null !== errors) {
          console.log(errors)
          return
        }
        console.log('长度===', response.xml.prepay_id.text().length)
        var prepay_id = response.xml.prepay_id.text()
        console.log('解析后的prepay_id==', prepay_id)

        //将预支付订单和其他信息一起签名后返回给前端
        let package = 'prepay_id=' + prepay_id
        let signType = 'MD5'
        let minisign = wxpay.paysignjsapimini(
          appid,
          nonce_str,
          package,
          signType,
          timestamp,
          mchkey
        )
        res.end(
          JSON.stringify({
            status: '200',
            data: {
              appId: appid,
              partnerId: mchid,
              prepayId: prepay_id,
              nonceStr: nonce_str,
              timeStamp: timestamp,
              package: 'Sign=WXPay',
              paySign: minisign
            }
          })
        )
      })
    }
  })
})

//微信获取sessicon
router.post('/jscode2session', function(req, res) {
  let APPID = appid
  let SECRET = appsecret
  let CODE = req.body.code
  let _res = res
  let url =
    'https://api.weixin.qq.com/sns/jscode2session?appid=' +
    APPID +
    '&secret=' +
    SECRET +
    '&js_code=' +
    CODE +
    '&grant_type=authorization_code'
  request({ url: url, method: 'GET' }, function(err, res, body) {
    body = JSON.parse(body)
    _res.json(body)
    // _res.end(JSON.stringify({ "openid": body.openid, "session_key": body.session_key }));
  })
})

module.exports = router
