var dgram = require('dgram')
var server = dgram.createSocket('udp4')
server.on('message', function(msg, rinfo) {
  console.log('server got:' + msg + 'from' + rinfo.address + ':' + rinfo.port)
})
server.on('listening', function() {
  console.log(
    'server listening' + server.address().address + server.address().port
  )
})

server.bind(41234)
