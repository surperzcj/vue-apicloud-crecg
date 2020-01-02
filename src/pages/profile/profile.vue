<template>
    <div id="app">
        <div class="user-form">
            <div class="user-form-item-avatar">
                <div class="avatar-container" @click="modifyAvatar">
                    <img :src="avatar" v-if="avatar" alt="">
                    <div class="user-photo">
                      <img src="../../assets/images/Photo.png" alt="" srcset="">
                    </div>
                </div>
            </div>
            <div class="user-form-item">
                用户名称
                <span v-text="name"></span>
            </div>
            <div class="user-form-item">
                用户账号
                <span v-text="mobile"></span>
            </div>
            <div class="user-form-item editable" @click="openForgot">
                重置密码
            </div>
            <div class="user-form-item editable" @click="toMessagePage">
                消息中心
                <span class="unread" v-if="unread>0" v-text="unread"></span>
            </div>
            <div class="user-form-item">
                当前版本
                <span v-if="appVersion" v-text="appVersion"></span>
            </div>
            <div class="user-form-logout">
                <div @click="logout">退出</div>
            </div>
        </div>
    </div>
</template>

<script>
  import {getUserData, saveUserData} from '../../utils/CacheUtils'
  import {editProfileAvatar, getUserInfo, logout} from '../../utils/DataUtils'
  import {
    sendEvent,
    addEventListener,
    openWindow,
    confirm,
    uploadFile,
    toast,
    apiReady
  } from '../../utils/ApiCloudUtils'
  import {getUserUnreadMessageNumber} from '../../utils/Sqlite'

  export default {
    name: 'profile',
    data () {
      return {
        name: '',
        mobile: '',
        unread: '',
        avatar: '',
        task: null,
        appVersion: null
      }
    },
    async created () {
      addEventListener('rongcloud_get_message', () => {
        this.setUnread()
      })
      addEventListener('read_message', () => {
        this.setUnread()
      })

      let user = await getUserData()
      this.name = user.name
      this.mobile = user.mobile
      this.avatar = user.avatar
      this.setUnread()
      this.getData()

      setInterval(() => {
        this.getData()
      }, 1000 * 60 * 30)
      await apiReady()
      this.appVersion = window.api.appVersion
    },
    methods: {
      async logout () {
        if (!await confirm('确认退出登录')) {
          return
        }

        await logout()
        saveUserData(null)
        sendEvent('user-logout')
      },
      async setUnread () {
        if (this.task) {
          clearTimeout(this.task)
          this.task = null
        }

        this.unread = await getUserUnreadMessageNumber()
        window.api.setAppIconBadge({
          badge: this.unread
        })
        this.task = setTimeout(() => {
          this.setUnread()
        }, 500)
      },
      toMessagePage () {
        openWindow('messages.html', '消息中心')
      },
      async getData () {
        let { c, m, d } = await getUserInfo()
        if (c !== 0) {
          return
        }

        this.name = d.name
        this.mobile = d.mobile
        this.avatar = d.avatar
        saveUserData(d)
      },
      modifyAvatar () {
        window.api.actionSheet({
          title: '修改头像',
          cancelTitle: '取消',
          buttons: ['从相册选取', '拍照']
        }, ({ buttonIndex }) => {
          if (buttonIndex === 1) {
            this.openPicture('album')
          } else if (buttonIndex === 2) {
            this.openPicture('camera')
          }
        })
      },
      openPicture (type) {
        window.api.getPicture({
          sourceType: type,
          encodingType: 'jpg',
          mediaValue: 'pic',
          destinationType: 'base64',
          allowEdit: true,
          quality: 90,
          targetWidth: 400,
          // targetHeight: 200,
          saveToPhotoAlbum: false
        }, ret => {
          if (ret) {
            this.editAvatar(ret)
          }
        })
      },
      async editAvatar ({ base64Data, data }) {
        const old = this.avatar
        this.avatar = base64Data
        let r = await uploadFile(data)
        if (r.c !== 0) {
          this.avatar = old
          return toast(r.m)
        }

        let { c, m, d } = await editProfileAvatar(r.d.key)
        toast(m)
        if (c !== 0) {
          return this.avatar = old
        }

        this.getData()
      },
      openForgot () {
        openWindow('forgot.html', '忘记密码')
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .user-form {
        .user-form-item-avatar {
            position: relative;
            // margin-top: 47px;
            // @size: 20%;
            // margin-left: 50%-@size/2;
            width: 100%;
            margin-bottom: 44px;
            height: 180px;
            background-image: data-uri('image/png;base64','../../assets/images/profile-bg.png');
            background-repeat: no-repeat;
            background-position: center;
            background-size: 100% 100%;

            .avatar-container {
                position: absolute;
                width: 87px;
                height: 87px;
                border-radius: 44px;
                left: 50%;
                top: 138px;
                margin-left: -44px;


                img {
                    width: 100%;
                    height: 100%;
                    -webkit-border-radius: 50%;
                    -moz-border-radius: 50%;
                    border-radius: 50%;
                }
                .user-photo {
                  position: absolute;
                  background: #6478D3;
                  width: 31px;
                  height: 31px;
                  right: 0;
                  bottom: 0;
                  border-radius: 50%;
                  text-align: center;
                  img {
                    width: 80%;
                    height: 80%;
                    margin-top: 3px;
                  }
                }
            }
        }

        .user-form-item {
            position: relative;
            padding: 0 22px;
            padding-right: 22px;
            height: 64px;
            line-height: 64px;
            // color: rgb(21, 21, 38);
            color: #8D92A3;
            letter-spacing: 1px;
            font-size: 14px;

            & > span {
                float: right;
                color: #22242A;

                &.unread {
                    position: absolute;
                    right: 34px;
                    top: 34px;
                    margin-top: -10px;
                    height: 20px;
                    width: 20px;
                    line-height: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #fff;
                    background-color: #EF4B5F;
                    -webkit-border-radius: 50%;
                    -moz-border-radius: 50%;
                    border-radius: 50%;
                }
            }

            &.editable:after {
                position: absolute;
                content: ' ';
                right: 22px;
                top: 50%;
                width: 8px;
                height: 8px;
                margin-top: -4px;
                border-right: 2px solid #CDCDD7;
                border-bottom: 2px solid #CDCDD7;
                -webkit-transform: rotate(-45deg);
                -moz-transform: rotate(-45deg);
                -ms-transform: rotate(-45deg);
                -o-transform: rotate(-45deg);
                transform: rotate(-45deg);
            }

            &:before {
                position: absolute;
                content: '';
                bottom: 0;
                left: 22px;
                right: 22px;
                height: 1px;
                background: rgb(218, 218, 218);
                -webkit-transform: scaleY(0.5);
                -moz-transform: scaleY(0.5);
                -ms-transform: scaleY(0.5);
                -o-transform: scaleY(0.5);
                transform: scaleY(0.5);
            }

            &:active {
                background: #eee;
            }
        }

        .user-form-logout {
            padding: 0 23px;
            height: 46px;
            margin-top: 60px;


            & > div {
                width: 100%;
                line-height: 46px;
                text-align: center;
                color: #fff;
                background: #CDCDD7;
                letter-spacing: 2px;
                font-size: 16px;
                border-radius: 23px;

                &:active {
                    opacity: 0.7;
                }
            }
        }
    }
</style>
