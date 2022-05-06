class Login {
    constructor() {
        //给登录按钮绑定点击事件
        this.$('.login-w .over').addEventListener('click', this.clickFn.bind(this))
    }
    clickFn() {
        // console.log(location.search.split('=')[1]);

        //点击后获取页面中form表单
        let forms = document.forms[0].elements;
        // console.log(forms);
        let username = forms.uname.value;
        let password = forms.password.value;
        //判断是否为空
        if (!forms.uname.value.trim() || !password.trim()) throw new Error('can not is null');
        // console.log(username,password);
        //注意要发送post请求
        axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        //xhr.setReuestHeader
        //对参数进行编码
        let data = `username=${username}&password=${password}`;
        axios.post('http://localhost:8888/users/login', data).then(res => {
            // console.log(data);
            let { status, data } = res;
            console.log(data);
            if (status == 200) { //请求成功

                //判断是否登录成功
                if (data.code == 1) {
                    //token是登录的 标识符
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user_id', data.user.id);
                    //从哪里来，跳转到哪里去
                    location.assign(location.search.split('=')[1]);
                }else{  //登录失败，就提示输入错误
                    layer.open({
                        title: '登录提示'
                        , content: '用户名或者密码输入错误！'
                    });
                }
            }
        });
    }

    $(tag) {
        let res = document.querySelectorAll(tag)
        return res.length == 1 ? res[0] : res;
    }

}
new Login; 