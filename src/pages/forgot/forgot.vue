<template>
    <div id="app" class="register-container">
        <div class="register-header">
            <JHeader title="忘记密码" show-back="true" new-bg="true" v-on:btnLeftClick="btnLeftClick"/>
            <div class="avatar">
                <img src="http://apppicture.bjtkcloud.com/user_avatar_default" title="头像"/>
            </div>
        </div>
        <div class="register-form">
            <div class="register-form-item">
                <label><img src="../../assets/images/icon-register-mobile.png"></label>
                <div class="register-form-input">
                    <input type="text" placeholder="手机号码" v-model="form.mobile"/>
                </div>
            </div>
            <div class="register-form-item">
                <label><img src="../../assets/images/icon-register-code.png"></label>
                <font @click="getCode" v-text="codeText" :class="codeRemain === 0?'':'disabled'"></font>
                <div class="register-form-input">
                    <input type="text" placeholder="验证码" v-model="form.code"/>
                </div>
            </div>
            <div class="register-form-item password">
                <label><img src="../../assets/images/icon-register-password.png"></label>
                <div class="register-form-input">
                    <input :type="showPassword ? 'password': '' " placeholder="请输入密码" v-model="actPassword"/>
                    <div class="register-form-password" :class="showPassword?'active':''"
                         @click="showPassword=!showPassword"></div>
                </div>
            </div>
            <div class="register-form-submit" @click="submit">保存</div>
        </div>
    </div>
</template>

<script>
  import md5 from 'md5'
  import JHeader from '../../components/JHeader'
  import {getForgotSms, resetPassword} from '../../utils/DataUtils'
  import {closeWindow, toast} from '../../utils/ApiCloudUtils'

  export default {
    name: 'app',
    components: { JHeader },
    data () {
      return {
        showPassword: false,
        _actPassword: '',
        codeText: '获取验证码',
        codeRemain: 0,
        get actPassword () {
          return this._actPassword
        },
        set actPassword (p) {
          this._actPassword = p
          this.form.password = md5(p)
        },
        form: {
          mobile: '',
          code: '',
          password: '',
          token: ''
        }
      }
    },
    methods: {
      btnLeftClick(){
        closeWindow();
      },
      count () {
        this.codeRemain--
        this.codeText = this.codeRemain === 0 ? '获取验证码' : `${this.codeRemain}S`
        if (this.codeRemain > 0) {
          setTimeout(() => {
            this.count()
          }, 1000)
        }
      },
      async getCode () {
        if (this.codeRemain > 0) {
          return
        }
        if (!this.form.mobile) {
          return toast('请输入手机号码')
        }
        this.codeRemain = 60
        this.codeText = '获取中..'

        let { c, m, d } = await getForgotSms(this.form.mobile)
        if (c !== 0) {
          this.codeRemain = 0
          this.codeText = '获取验证码'
          return
        }

        toast(m)
        this.count()
        this.form.token = d
      },
      async submit () {
        let errors = {
          mobile: '请输入手机号码',
          code: '请输入短信验证码',
          password: '请输入密码',
          token: '请先获取短信验证码'
        }

        let validate = Object.keys(errors).every(field => {
          if (!this.form[field]) {
            return toast(errors[field])
          }

          return true
        })
        console.log('validate submit result', validate)
        if (!validate) {
          return
        }

        let { c, m } = await resetPassword(this.form)
        if (c !== 0) {
          return
        }

        toast(m)
        setTimeout(closeWindow, 300)
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";
    html, body, #app {
        height: 100%;
        background: #fff !important;
    }
    .register-container {
        overflow: hidden;
        display: flex;
        flex-flow: column wrap;

        .c-header {
            background-color: transparent;
        }

        .register-header {
            position: relative;
            width: 100%;
            padding-bottom: 190px;
            background-image: data-uri('image/png;base64', '../../assets/images/newbg.png') !important;
            background-size: 100% auto !important;
            background-repeat: no-repeat !important;
            background-position: top !important;

            .avatar {
                @size: 80px;
                left: 50%;
                bottom: 35px;
                margin-left: -@size/2;
                position: absolute;
                width: @size;
                height: @size;
                background-color: #535f68;
                border-radius: 50%;
                overflow: hidden;

                img {
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }

    .register-form {
        flex: 1;
        overflow: auto;
        padding-top: 20px;
        padding-left: 22px;
        padding-right: 22px;

        .register-form-item {
            position: relative;
            height: 62px;
            padding: 20px 0;
            color: #8D92A3;

            &:after {
                position: absolute;
                content: '';
                left: 0;
                right: 0;
                bottom: 0;
                height: 1px;
                background: #F1F3F8;
                -webkit-transform: scaleY(0.5);
                -moz-transform: scaleY(0.5);
                -ms-transform: scaleY(0.5);
                -o-transform: scaleY(0.5);
                transform: scaleY(0.5);
            }

            &.password {
                input {
                    padding-right: 36px;
                }

                .register-form-password {
                    position: absolute;
                    right: 0;
                    top: 15px;
                    content: '';
                    width: 36px;
                    height: 36px;
                    background-image: data-uri('image/png;base64', "../../assets/images/icon-eye.png");
                    background-repeat: no-repeat;
                    background-position: center;
                    background-size: 15px auto;

                    // &.active {
                    //     background-image: data-uri('image/png;base64', "../../assets/images/icon-eye-active.png");
                    // }
                }
            }

            label {
                position: absolute;
                left: 0;
                top: 20px;

                img {
                    width: 20px;
                    vertical-align: -4px;
                }
            }

            .register-form-input {
                padding-left: 27px;
                height: 22px;
                line-height: 22px;

                input {
                    width: 100%;
                    height: 100%;
                    font-size: 14px;
                    letter-spacing: 1px;
                    background: transparent;
                    outline: none;
                    border: 1px solid #fff;
                    -webkit-appearance:none; /*去除input默认样式*/
                    -webkit-tap-highlight-color:rgba(0, 0, 0, 0); /*去除点击高亮的颜色*/
                }
            }

            font {
                position: absolute;
                right: 0;
                padding-left: 10px;
                padding-right: 10px;
                height: 22px;
                line-height: 22px;
                font-size: 12px;
                text-align: center;
                color: #fff;
                // background: @baseColor;
                -webkit-border-radius: 9.5px;
                -moz-border-radius: 9.5px;
                // border-radius: 9.5px;
                background: #6478D3;
                border-radius: 4px;

                &:active {
                    background: @baseColorActive;
                }
            }

            font ~ .register-form-input {
                padding-right: 136px;
            }
        }

        .register-form-submit {
            margin-top: 30px;
            margin-bottom: 20px;
            width: 100%;
            height: 46px;
            line-height: 46px;
            text-align: center;
            letter-spacing: 1px;
            color: #fff;
            background: #6478D3;
            font-size: 16px;
            border-radius: 23px;

            &:active {
                opacity: 0.7;
            }
        }
    }
</style>
