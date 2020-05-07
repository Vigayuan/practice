const koa = require('Koa')
const fs = require('fs')
const app = new koa()
const router = require('koa-router')()
const bodyparser = require('koa-bodyparser')
const controller = require('./controller')

app.use(bodyparser())
app.use(controller())
app.listen(3000)

console.log('app started at port 3000...')
