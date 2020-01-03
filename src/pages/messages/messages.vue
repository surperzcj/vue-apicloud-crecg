<template>
    <div id="app">
        <div class="empty-message" v-if="isEmpty">
            <img src="../../assets/images/empty-messages.png">
            <div>暂无消息内容</div>
        </div>
        <ul class="messages-container" v-else>
            <!--<li class="messages-new" @click="openSelectUsers">找人聊天</li>-->
            <li v-for="message in messages" @click="toDetail(message)">
                <div class="avatar">
                    <img src="../../assets/images/avatar-settings.png" v-if="message.targetUserId === 'system'"/>
                    <img :src="message.avatarUrl" v-else>
                    <span class="unread-tag" v-if="message.unread > 0"></span>
                </div>
                <div class="title">
                    <span class="name" v-html="message.juname || '&nbsp;'"></span>
                    <span class="time" v-text="formatTime(message.updated)"></span>
                </div>
                <div class="content" v-html="formatContent(message)"></div>
            </li>
        </ul>
    </div>
</template>

<script>
  import {getUserMessages, markTargetUserMessageAllRead} from '../../utils/Sqlite'
  import {addEventListener, apiReady, openWindow, sendEvent} from '../../utils/ApiCloudUtils'
  import {getCacheRegisteredUsers, getCacheUserById} from '../../utils/CacheUtils'
  import {diffTimestampFormat, formatDate, parseEmojiContent} from '../../utils/CommonUtils'

  export default {
    name: 'app',
    components: {},
    data () {
      return {
        messages: [],
        users: [],
        currentTimestamp: new Date().getTime()
      }
    },
    async created () {
      addEventListener('rongcloud_get_message', this.getData.bind(this))
      addEventListener('chat_send_message', this.getData.bind(this))
      addEventListener('layout-windowViewAppear', this.getData.bind(this))

      addEventListener('register_users_selected', ({ selectedUser, winName }) => {
        if (winName !== window.api.winName) {
          return
        }
        openWindow('chat.html', selectedUser.juname, {
          selectedUser,
          openChatBox: true,
          showAvatar: { url: selectedUser.avatarUrl }
        })
      })
      addEventListener('layout-btnRight-click', ({ selectedUser, winName }) => {
        if (winName !== window.api.winName) {
          return
        }
        this.openSelectUsers()
      })

      this.users = await getCacheRegisteredUsers()
      this.getData()
      await apiReady()
      sendEvent('layout-showBtnRight', {
        winName: window.api.winName,
        btnRight: {
          text: '+',
          style: 'font-size:28px;'
        }
      })
    },
    methods: {
      formatTime (ts) {
        let diff = (this.currentTimestamp - parseInt(ts)) / 1000
        return diffTimestampFormat(diff, ts)
      },
      async getData () {
        let messages = await getUserMessages()
        this.messages = messages.map(message => {
          if (message.targetUserId === 'system') {
            message.juname = '系统消息'
          } else {
            let user = getCacheUserById(this.users, message.targetUserId)
            message.juname = user && user.juname ? user.juname : ''
            message.avatarUrl = user && user.avatarUrl ? user.avatarUrl : ''
          }
          return message
        })
        console.log('get messages', JSON.stringify(this.messages, null, 4))
      },
      openSelectUsers () {
        openWindow('register_users.html', '选择人员', {
          winName: window.api.winName,
          timeToCloseWindow: 500
        })
      },
      async toDetail (message) {
        const url = message.targetUserId === 'system' ? '../../assets/images/avatar-settings.png' : message.avatarUrl
        openWindow('chat.html', message.juname, {
          selectedUser: { juid: message.targetUserId },
          openChatBox: true,
          showAvatar: { url }
        })
      },
      formatContent (message) {
        if (message.objectName === 'RC:TxtMsg') {
          return parseEmojiContent(message.contentText)
        } else if (message.objectName === 'RC:ImgMsg') {
          return '[图片]'
        }

        return '&nbsp;'
      }
    },
    computed: {
      isEmpty () {
        return this.messages.length === 0
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .empty-message {
        @height: 228px;
        @width: 200px;

        position: absolute;
        left: 50%;
        top: 40%;
        margin-top: -@height/2;
        margin-left: -@width/2;
        height: @height;
        width: @width;

        font-size: 14px;
        color: #8D92A3;
        text-align: center;

        img {
            width: 200px;
        }
    }

    .messages-container {
        list-style: none;

        li {
            &:not(.messages-new) {
                position: relative;
                padding: 20px;
                height: 88px;

                .avatar {
                    position: absolute;
                    left: 20px;
                    top: 20px;
                    width: 48px;
                    height: 48px;

                    & > img {
                        height: 100%;
                        width: 100%;
                        -webkit-border-radius: 50%;
                        -moz-border-radius: 50%;
                        border-radius: 50%;
                    }

                    .unread-tag {
                        @size: 9px;
                        position: absolute;
                        right: 2px;
                        bottom: 2px;
                        width: @size;
                        height: @size;
                        text-align: center;
                        font-size: 12px;
                        background: #51DC8E;
                        -webkit-border-radius: 50%;
                        border-radius: 50%;
                        border: 1px solid #fff;

                        /*&:after {
                            @insideSize: 9px;
                            position: absolute;
                            content: '';
                            left: (@baseSize - @insideSize)/2;
                            top: (@baseSize - @insideSize)/2;
                            width: @insideSize;
                            height: @insideSize;
                            background: #51DC8E;
                            -webkit-border-radius: 50%;
                            border-radius: 50%;
                        }*/
                    }
                }

                .title {
                    padding-left: 63px;

                    .name {
                        color: #22242A;
                        font-size: 14px;
                        line-height: 22px;
                    }

                    .time {
                        float: right;
                        font-size: 10px;
                        color: #8D92A3;
                        letter-spacing: 1px;
                        text-align: right;
                        line-height: 17px;
                    }
                }

                .content {
                    padding-left: 63px;
                    white-space: nowrap;
                    word-break: break-all;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-size: 12px;
                    color: #8D92A3;
                    line-height: 22px;
                }
            }

            &:after {
                position: absolute;
                content: '';
                left: 83px;
                right: 22px;
                bottom: 0;
                height: 1px;
                background: #d5d5d5;
                -webkit-transform: scaleY(0.5);
                -moz-transform: scaleY(0.5);
                -ms-transform: scaleY(0.5);
                -o-transform: scaleY(0.5);
                transform: scaleY(0.5);
            }

            &.messages-new {
                position: relative;
                padding: 5px;
                line-height: 30px;
                text-align: center;

                &:before {
                    position: absolute;
                    content: '';
                    top: 14px;
                    right: 22px;
                    height: 10px;
                    width: 10px;
                    border-right: 1px solid #d5d5d5;
                    border-bottom: 1px solid #d5d5d5;
                    -webkit-transform: rotate(-45deg);
                    -moz-transform: rotate(-45deg);
                    -ms-transform: rotate(-45deg);
                    -o-transform: rotate(-45deg);
                    transform: rotate(-45deg);
                }
            }

            &:active {
                background-color: #eee;
            }
        }
    }
</style>
