window.onload = function() {
    //实例并初始化我们的hichat程序
    var hichat = new HiChat();
    hichat.init();
};

//定义我们的hichat类
var HiChat = function() {
    this.socket = null;
};

//向原型添加业务方法
HiChat.prototype = {
    init: function() {//此方法初始化程序
        var that = this;
        //建立到服务器的socket连接
        this.socket = io();
        //监听socket的connect事件，此事件表示连接已经建立
        this.socket.on('connect', function() {
            //连接到服务器后，显示昵称输入框
            document.getElementById('info').textContent = 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('controls').style.display = 'none';
            document.getElementById('nicknameInput').focus();
        });
        //昵称设置的确定按钮
        document.getElementById('loginBtn').addEventListener('click', function() {
            const nickName = document.getElementById('nicknameInput').value;
            //检查昵称输入框是否为空
            if (nickName.trim().length != 0) {
                //不为空，则发起一个login事件并将输入的昵称发送到服务器
                that.socket.emit('login', nickName);
            } else {
                //否则输入框获得焦点
                document.getElementById('nicknameInput').focus();
            };
        }, false);
        // 设置提示
        this.socket.on('nickExisted', function() {
            document.getElementById('info').textContent = '!nickname is taken, choose another pls'; //显示昵称被占用的提示
        });
        // 登陆成功后的操作
        this.socket.on('loginSuccess', function() {
            document.title = 'hichat | ' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';//隐藏遮罩层显聊天界面
            document.getElementById('controls').style.display = 'block';
            document.getElementById('messageInput').focus();//让消息输入框获得焦点
        });
        this.socket.on('system', function(nickName, userCount, type) {
            const msg = nickName + (type === 'login' ? ' joined' : ' left');
            that._displayNewMsg('system', msg, '#ccf');
        });
        this.socket.on('newMsg', function(user, msg) {
            that._displayNewMsg(user, msg);
        });
        document.getElementById('sendBtn').addEventListener('click', function() {
            const messageInput = document.getElementById('messageInput'),
                  msg = messageInput.value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg);
                that._displayNewMsg('me', msg);
            }
        }, false);
        document.getElementById('sendImage').addEventListener('change', function() {
            if (this.files.length != 0) {
                const file = this.files[0],
                      reader = new FileReader();
                if (!reader) {
                    that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
                    this.value = '';
                    return;
                };
                reader.onload = function(e) {
                    this.value = '';
                    that.socket.emit('img', e.target.result);
                    that._displayImage('me', e.target.result);
                };
                reader.readAsDataURL(file);
            };
        }, false);
    },
    _displayNewMsg: function(user, msg, color) {
        const container = document.getElementById('historyMsg'),
              msgToDisplay = document.createElement('p'),
              date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#ccf';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _displayImage: function(user, imgData, color) {
        const container = document.getElementById('historyMsg'),
              msgToDisplay = document.createElement('p');
              date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#ccf';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
};

