<template>
    <div class="layout-container login-container">
        <!-- <JHeader title="登录"/> -->
        <div class="login-logo">
          <img src="../../assets/images/LOGO@2x.png" alt="" srcset="">
        </div>
        <div class="login-form">
            
            <div class="login-form-mobile login-form_box">
                <input type="number" placeholder="请输入手机号" v-model="form.mobile"/>
            </div>
            <div class="login-form-password login-form_box">
                <input type="password" name="password" placeholder="请输入密码" v-model="form.password"/>
            </div>
            <div class="weui-cells weui-cells_checkbox">
                <!-- <div class="weui-cell__bd">记住密码</div>
                <div class="weui-cell__ft">
                    <input class="weui-switch" type="checkbox" v-model="form.remember">
                </div> -->
                <label class="weui-cell weui-check__label login-rember" for="s11">
                    <div class="weui-cell__hd">
                        <input type="checkbox" class="weui-check" name="checkbox1" id="s11" v-model="form.remember"/>
                        <i class="weui-icon-checked"></i>
                    </div>
                    <div class="login-tig">
                        记住密码
                    </div>
                </label>
            </div>
            <div class="login-form-submit" @click="btnLogin">登录</div>
        </div>

        <div class="login-footer" :style="{'padding-bottom': `${paddingBottom}px`}">
            <a href="javascript:;" @click="openForgot">忘记密码</a> |
            <a href="javascript:;" @click="openRegister">注册账号</a>
        </div>
    </div>
</template>

<script>
  import md5 from 'md5'
  import JHeader from '../../components/JHeader'
  import {login} from '../../utils/DataUtils'
  import {apiReady, openWindow, toast} from '../../utils/ApiCloudUtils'
  import {saveUserData} from '../../utils/CacheUtils'

  export default {
    name: 'login',
    data () {
      const remember = window.localStorage.getItem('user-login-remember')
      return {
        paddingBottom: 0,
        form: {
          mobile: window.localStorage.getItem('user-login-mobile'),
          password: window.localStorage.getItem('user-login-password'),
          remember: remember === null ? true : remember
        },
        store: {
          mobile: window.localStorage.getItem('user-login-mobile'),
          password: window.localStorage.getItem('user-login-password')
        }
      }
    },
    components: { JHeader },
    async created () {
      await apiReady()
      this.paddingBottom = window.api.safeArea.bottom
    },
    methods: {
      _validateLoginForm () {
        if (!this.form.mobile) {
          return toast('请输入手机号') && false
        }

        if (!this.form.password) {
          return toast('请输入密码') && false
        }

        return true
      },
      async btnLogin () {
        if (!this._validateLoginForm()) {
          return
        }

        let mobile, password
        if (this.store.mobile === this.form.mobile && this.store.password === this.form.password) {
          mobile = this.store.mobile
          password = this.store.password
        } else {
          mobile = this.form.mobile
          password = md5(this.form.password)
        }

        let { c, m, d } = await login(mobile, password)
        toast(m)
        if (c !== 0) {
          return
        }

        window.localStorage.setItem('user-login-remember', this.form.remember)
        if (this.form.remember) {
          window.localStorage.setItem('user-login-mobile', mobile)
          window.localStorage.setItem('user-login-password', password)
        } else {
          window.localStorage.removeItem('user-login-mobile')
          window.localStorage.removeItem('user-login-password')
        }

        saveUserData(d)
        this.$emit('loginSuccess')
      },
      async openRegister () {
        await apiReady()
        window.api.openWin({
          url: 'register.html',
          name: 'register'
        })
      },
      async openForgot () {
        // openWindow('forgot.html', '忘记密码')
        await apiReady()
        window.api.openWin({
          url: 'forgot.html',
          name: 'forgot'
        })
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    html, body, #app {
        height: 100%;
        width: 100%;
    }

    .login-container {
        background-image: data-uri('image/png;base64', '../../assets/images/newbg.png');
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-position: center;

        .c-header {
            background-color: transparent !important;
            font-size: 17px;
        }

        .layout-content {
            position: relative;
            background-color: transparent !important;
        }
    }

    .login-logo {
      width: 161px;
      margin: 0 auto;
      padding-top: 22%;

      img {
          width: 100%;
      }
    }

    .login-form {
        @formHeight: 320px;
        position: absolute;
        padding: 0 10.5%;
        width: 100%;
        height: @formHeight;
        top: 50%;
        left: 0;
        margin-top: -(@formHeight/2);

        

        .login-form-mobile,
        .login-form-password {
            @inputPaddingLeft: 45px;
            @inputHeight: 36px;

            position: relative;
            margin-top: 14px;

            input {
                width: 100%;
                height: @inputHeight;
                background-color: transparent;
                border: none;
                // border-bottom: 1px solid #fff;
                color: #fff;
                padding-left: @inputPaddingLeft;
                letter-spacing: 2px;

                &::-webkit-input-placeholder,
                &::placeholder {
                    color: #fff;
                }
            }

            &:before {
                position: absolute;
                content: ' ';
                left: 0;
                right: 0;
                height: @inputHeight;
                width: @inputPaddingLeft;
                background-repeat: no-repeat;
                background-size: 14px auto;
                background-position-y: center;

            }
        }

        .login-form_box {
          border-bottom: 1px solid #fff;
          padding-bottom: 2.5%;
        }

        .login-form-mobile:before {
          background-size: 22px auto;
            background-image: data-uri('image/png;base64', "../../assets/images/icon-mobile.png");
        }

        .login-form-password:before {
            background-size: 18px auto;
            background-image: data-uri('image/png;base64', "../../assets/images/icon-password.png");
        }

        .login-form-submit {
            width: 100%;
            background-color: #F1F8FC;
            height: 46px;
            line-height: 46px;
            color: #000;
            font-size: 16px;
            letter-spacing: 2px;
            text-align: center;
            border-radius: 46px;

            &:active {
                opacity: 0.7;
            }
        }

        .login-form-remember {
            padding-top: 10px;
            padding-left: 0;
            padding-right: 0;
            color: #fff;
            border: 0;
            font-size: 14px;

            &:before {
                display: none;
            }
        }
    }

    .login-footer {
        position: absolute;
        bottom: 0;
        left: 0;
        text-align: center;
        width: 100%;
        color: rgb(255, 255, 255);

        a {
            padding: 0 3px;
            display: inline-block;
            font-size: 12px;
            line-height: 54px;
            color: rgb(255, 255, 255);
        }
    }

    .weui-cells {
        background: transparent;
        text-align: right;

        &::before {
            border: none !important;
        }

        &::after {
            border: none !important;
        }

        .login-tig {
            display: inline-block;
            color: #fff;
            opacity: 0.8;
            font-size: 12px;
        }

        .login-rember {
            float: right;
            padding: 10px 0 50px 0;

            .weui-cell__hd {
                padding-right: 0
            }

            .weui-icon-checked {
                vertical-align: -1px;
            }

            .weui-icon-checked:before {
                font-size: 14px;
                color: #fff !important;
            }
        }
    }

    .weui-check__label {
        &:active {
            background-color: transparent;
        }
    }

    .login-form-mobile input, .login-form-password input {
        outline: none;
        // padding-bottom: 10px;
    }
</style>



