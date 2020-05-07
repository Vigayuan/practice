const https = require('https')
const fs = require('fs')
const cheerio = require('cheerio')
const request = require('request')

var i = 0
var code = 0491466
// var code = 111111111111
var pageUrl = 'https://web.zkh360.com/view/home/new_zkh_product.html?proSkuNo=AA0491466'

function fetchPage(url) {
  startRequest(url)
}
function startRequest(url) {
  https
    .get(url, res => {
      var html = ''
      res.setEncoding('utf-8')
      res.on('data', function(chunk) {
        html += chunk
      })
      res.on('end', function() {
        var $ = cheerio.load(html)
        if ($('.span_page_not_found')) {
          code += 1
          i++
          var nextPage = 'https://web.zkh360.com/view/home/new_zkh_product.html?proSkuNo=AA' + code + '/'
          if (i < 2000) {
            fetchPage(nextPage)
          }
        }
        var name = $('#r-goodsNameTwoLine')
          .text()
          .trim()
        var pds_item = {
          name: name,
          brand: $('.proview_name').children()
            .text()
            .trim(),
          code: code,
          price: $('.summary-price').find('span').eq(3).text()
          .trim()
        }
        saveContent($, pds_item)
        // saveImg($, name)
        code += 1
        i++
        var nextPage = 'https://web.zkh360.com/view/home/new_zkh_product.html?proSkuNo=AA' + code + '/'
        if (i < 2000) {
          fetchPage(nextPage)
        }
      })
    })
    .on('error', function(err) {
      reject(err)
    })
}

function saveContent($, pds_item) {
  if (!pds_item.name) return
  fs.appendFile('./data/pdName.txt', `${i}":"${pds_item.name}价格${price}\n`, 'utf-8', function(
    err
  ) {
    if (err) throw err
  })
}

function saveImg($, name) {
  $('.mc-img').each(function(index, item) {
    var title = $(this)
      .attr('alt')
      .replace(/\"/g, '')
    var img_name = title + '.jpg'
    var img_src = 'https:' + $(this).attr('src')
    request(img_src).pipe(
      fs.createWriteStream('./image/' + code + '---' + img_name)
    )
  })
}
fetchPage(pageUrl)
