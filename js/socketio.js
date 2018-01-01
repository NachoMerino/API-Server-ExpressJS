const socket = io.connect('http://localhost:3000');
socket.on('connect', function(data) {
  socket.emit('join', 'Client suscessfuly connected');
});
socket.on('ramUsageFree', function(data) {
  $('#future')
    .empty()
    .append(`Free RAM in the system ${Math.round(data)} %`);
});
socket.on('ramFree', function(data) {
  $('#totalram')
    .empty()
    .append(`Free RAM in the system ${Math.round(data/100)} MB`);
});
socket.on('upTime', function(data) {
  $('#uptime')
    .empty()
    .append(`<%= hostName %> up since: ${data} seconds`);
});
socket.on('cpu', function(data) {
  $('#cpu')
    .empty()
    .append(`CPU Usage ${Math.round(data*100)} %`);
});
