class Cart {
    constructor() {
        this.checkLogin()
        this.getCartGoods();
        this.bindEve();
    }
    //绑定事件
    bindEve() {
        this.$('.cart-list').addEventListener('click', this.distributeEve.bind(this));

        //给全选按钮绑定事件
        this.$('.cart-th input').addEventListener('click', this.clickAllChecked.bind(this))
    }


    //操作购物车页面，判断用户是否登录 ，必须登录
    async checkLogin() {
        //获取token值，进行判断
        const TOKEN = localStorage.getItem('token');
        //判断登录是否过期
        axios.defaults.headers.common['authorization'] = TOKEN;
        let userId = localStorage.getItem('user_id');
        let { data, status } = await axios.get('http://localhost:8888/users/info/' + userId);
        console.log(data);
        //如果没有token值，肯定没登录
        if (!TOKEN || data.code == 401) {
            location.assign('./login.html?ReturnUrl=./cart.html')
        }
    }
    //获取购物车中的数据
    async getCartGoods() {
        const TOKEN = localStorage.getItem('token');
        let userId = localStorage.getItem('user_id')
        axios.defaults.headers.common['authorization'] = TOKEN;
        let { data, status } = await axios.get('http://localhost:8888/cart/list?id=' + userId);
        if (status == 200) {
            //判断是否超过有效期,过期则跳转到登录页面
            if (data.code == 401) location.assign('./login.html?ReturnUrl=./cart.html')
            //判断接口的状态
            if (data.code == 1) {
                let html = '';
                // console.log(data.cart);
                data.cart.forEach(goods => {
                    html += `<ul data-id="${goods.goods_id}" class="goods-list yui3-g">
                    <li class="yui3-u-3-8 pr">
                        <input type="checkbox" class="good-checkbox">
                        <div class="good-item">
                            <div class="item-img">
                                <img src="${goods.img_small_logo}">
                            </div>
                            <div class="item-msg">${goods.title}</div>
                        </div>
                    </li>
                    <li class="yui3-u-1-8">
                        
                    </li>
                    <li class="yui3-u-1-8">
                        <span class="price">${goods.price}</span>
                    </li>
                    <li class="yui3-u-1-8">
                        <div class="clearfix">
                            <a href="javascript:;" class="increment mins">-</a>
                            <input autocomplete="off" type="text" value="${goods.cart_number}" minnum="1" class="itxt">
                            <a href="javascript:;" class="increment plus">+</a>
                        </div>
                        <div class="youhuo">有货</div>
                    </li>
                    <li class="yui3-u-1-8">
                        <span class="sum">${goods.price * goods.cart_number}</span>
                    </li>
                    <li class="yui3-u-1-8">
                        <div class="del1">
                            <a href="javascript:;">删除</a>
                        </div>
                        <div>移到我的关注</div>
                    </li>
                </ul>`;
                });
                this.$('.cart-list').innerHTML = html;
            }

        }

    }
    //将单个商品的操作都委托给cart-list（父级），使用分发的方法目的在于：页面中有多个地方都会触发div.cart-list上的点击事件，所以需要区别
    //(eve)
    //直接解构赋值，获取事件源
    distributeEve({ target }) {  //distribute分发 分配，

        //判断是否有del1个class，是 则点击的为删除按钮
        if (target.parentNode.classList.contains('del1')) {
            this.delGoods(target);


            // console.log(target);

        }
        //判断点击是否为单个商品的选中按钮
        if (target.classList.contains('good-checkbox')) {
            // console.log(target);
            this.getOneGoodsCheck(target);
            //统计商品数量和价格的方法
            this.getNumPriceGoods();
        }
    }
    //删除的方法
    delGoods(target) {
        let that=this;
        //确认是否删除
        let layerIndex = layer.confirm('你要残忍抛弃我吗？', {
            title: '删除提示',
        }, function () {
            // console.log('确定了');
            //获取商品id
            let ulObj = target.parentNode.parentNode.parentNode;
            // console.log(ulObj);
            let id = ulObj.dataset.id;
            // console.log(id); 
            //获取用户id
            let userId = localStorage.getItem('user_id');
            //发送ajax删除商品数据
            // console.log(id,userId);
            axios.get('http://localhost:8888/cart/remove?id=' + userId + '&goodsId=' + id)
                .then(res => {
                    let { data, status } = res;
                    // console.log(data,status);
                    if (data.code == 1) { //删除成功，则关闭弹出框，删除页面中的商品对应的ul
                        //关闭确认框
                        layer.close(layerIndex);
                        //提示删除成功
                        layer.msg('商品删除成功 ');
                        //在页面中删除节点
                        ulObj.remove();
                        //统计商品数量和价格的方法
                        that.getNumPriceGoods();
                    }
                })
        })
    }

    //单个商品的选中按钮的回调方法
    getOneGoodsCheck(target) {
        //如果是取消，则直接让全选 取消
        // console.log(target.checked);
        if (!target.checked) {
            this.$('.cart-th input').checked = false;
            return;
        }
        // console.log(target.checked);
        //如果点击的是选中，则 返回true
        if (target.checked) {
            //寻找页面中，没有被选中的商品 用断言函数(有一个false没选中的就停止)
            let res = Array.from(this.$('.good-checkbox')).find(checkbox => {
                //没有被选中，状态为false
                // console.log(checkbox.checked);
                return !checkbox.checked
            });
            // console.log(res);
            //如果返回undefined，则 是页面中都被选中
            if (!res) this.$('.cart-th input').checked = true;
        }
    }

    //获取页面中,所有选中商品的价格和数量
    getNumPriceGoods() {
        let goods = document.querySelectorAll('.goods-list');
        // console.log(goods);
        //迭代器
        // let res=goods[Symbol.iterator]();
        // console.log(res.next());
        // res.next()

        //保存数量和价格
        let totalNum = 0;
        let totalPrice = 0;
        let pn = goods.forEach(one => {
            // console.log(one.firstElementChild.firstElementChild);
            //只统计被选中的商品价格和数量
            if (one.firstElementChild.firstElementChild.checked) {
                // console.log(one);
                //数量的获取
                // console.log(one.querySelector('.itxt').value);
                totalNum = one.querySelector('.itxt').value - 0 + totalNum;// -0是为了将表单中获取到的数字都是字符串类型的，转化为数字类型
                // console.log(one.querySelector('.sum').innerHTML);
                totalPrice = one.querySelector('.sum').innerHTML - 0 + totalPrice;

            }
        });
        // console.log(totalNum,totalPrice);
        //设置到总计上
        this.$('.sumprice-top strong').innerHTML = totalNum;
        this.$('.sumprice-top .summoney').innerHTML = totalPrice;
    }

    //全选的实现
    clickAllChecked(eve) {
        // console.log(eve.target);
        //获取全选按钮的状态
        let checked = eve.target.checked;
        // console.log(checked);
        this.oneGoodsCheck(checked);
        //统计数量和价格的方法
        this.getNumPriceGoods();
    }
    //设置单个商品的选中状态
    oneGoodsCheck(checkStatus) {
        let goodsList = this.$('.goods-list')
        // console.log(goodsList,checkStatus); //全选选中时获取所有的商品节点
        goodsList.forEach(ul => {
            // console.log(ul);
            //找到单个商品的复选框
            ul.firstElementChild.firstElementChild.checked = checkStatus;
        })
    }
    $(tag) {
        let res = document.querySelectorAll(tag);
        return res.length == 1 ? res[0] : res;
    }
}
new Cart(); 