const express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    users = [];

app.use('/', express.static(__dirname + '/src/page'));

io.on('connection', function(socket){
    // 昵称设置
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            console.log(users);
            io.sockets.emit('system', nickname, users.length, 'login'); // 向所有连接到服务器的客户端发送当前登陆用户的昵称
        };
    });
    //断开连接的事件
    socket.on('disconnect', function() {
        //将断开连接的用户从users中删除
        users.splice(socket.userIndex, 1);
        //通知除自己以外的所有人
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });
    // 接收新信息
    socket.on('postMsg', function(msg) {
        socket.broadcast.emit('newMsg', socket.nickname, msg);
    });
    socket.on('img', function(imgData) {
        socket.broadcast.emit('newImg', socket.nickname, imgData);
    });
});

http.listen(3000, function(){
    console.log('server start');
});