<template>
    <div id="app" class="chat-container-app">
        <ul class="chat-container">
            <li v-for="message in messages" :class="(selfUserId+'' === message.targetId)?'friend':''">
                <div class="weui-loadmore weui-loadmore_line" v-if="message.messageId == firstUnreadMessageId">
                    <span class="weui-loadmore__tips">以下为新消息</span>
                </div>
                <div class="time-split" v-if="message.timeSpan">
                    <span v-text="message.timeSpan"></span>
                </div>
                <!--<div class="avatar">-->
                    <!--<img src="../../assets/images/avatar-settings.png" v-if="message.senderUserId === 'system'"/>-->
                    <!--<img :src="(selfUserId+'' !== message.targetId)?myAvatar:friendUser.avatarUrl" v-else/>-->
                <!--</div>-->
                <div class="content" v-html="formatContent(message)" @click="viewDetail(message)"></div>
            </li>
        </ul>
    </div>
</template>

<script>
  import {apiReady, getPageParams, sendEvent, toast, addEventListener, openWindow} from '../../utils/ApiCloudUtils'
  import {
    getFirstUnreadMessageId,
    getMessageGreaterThanMessageId,
    getMessagesWithTarget,
    insertMessageToDb,
    markTargetUserMessageAllRead
  } from '../../utils/Sqlite'
  import RongCloud from '../../utils/RongCloud'
  import {diffTimestampFormat, parseEmojiContent} from '../../utils/CommonUtils'
  import {getCacheRegisteredUsers, getCacheUserById, getUserData} from '../../utils/CacheUtils'

  export default {
    name: 'app',
    components: {},
    data () {
      return {
        page: 1,
        rongCloudClient: null,
        targetUser: null,
        messages: [],
        widgetDir: null,
        selfUserId: getUserData().userId,
        myAvatar: getUserData().avatar,
        friendUser: {},
        firstUnreadMessageId: null
      }
    },
    async created () {
      await apiReady()
      this.firstUnreadMessageId = await getFirstUnreadMessageId()
      console.log('firstUnreadMessageId', this.firstUnreadMessageId)

      this.rongCloudClient = new RongCloud()
      let { selectedUser } = await getPageParams()
      if (selectedUser.juid !== 'system') {
        this.openChatBox()
      }

      this.targetUser = selectedUser
      this.widgetDir = window.api.wgtRootDir
      this.getData()

      addEventListener('rongcloud_get_message', this.getLastDatas.bind(this))

      if (selectedUser.juid !== 'system') {
        let users = await getCacheRegisteredUsers()
        this.friendUser = getCacheUserById(users, selectedUser.juid) || {}
      }
    },
    methods: {
      async markMessageRead () {
        markTargetUserMessageAllRead(this.targetUser.juid)
        sendEvent('read_message')
      },
      concatMessages (messages, reversal = false) {
        let newMessages = []
        for (let i = messages.length - 1; i >= 0; i--) {
          newMessages.push(messages[i])
        }
        newMessages = reversal ? this.messages.concat(newMessages) : newMessages.concat(this.messages)

        let lastMessage = null
        newMessages.forEach(message => {
          message.timeSpan = ''
          if (lastMessage !== null && Math.abs(lastMessage.created - message.created) <= 60000) {
            return
          }

          let diff = (new Date().getTime() - message.created) / 1000
          let timeSpan = diffTimestampFormat(diff, message.created)
          if (lastMessage === null || lastMessage.timeSpan !== timeSpan) {
            message.timeSpan = timeSpan
            lastMessage = message
          }
        })

        this.messages = newMessages
        this.markMessageRead()
      },
      async getLastDatas () {
        const lastId = this.messages.length > 0 ? this.messages[this.messages.length - 1].messageId : 0
        let messages = await getMessageGreaterThanMessageId(this.targetUser.juid, lastId)
        console.log('new-messages', JSON.stringify(messages, null, 4))
        this.concatMessages(messages, true)
        this.$nextTick(() => {
          setTimeout(() => {
            window.api.pageDown({ bottom: true })
          }, 100)
        })
      },
      async getData () {
        let limit = this.page === 1 ? 5 : 20
        let messages = await getMessagesWithTarget(this.targetUser.juid, this.page, limit)
        this.concatMessages(messages)

        await apiReady()
        window.api.refreshHeaderLoadDone()
        if (messages.length === limit) {
          window.api.setRefreshHeaderInfo({
            // loadingImg: 'widget://image/refresh.png',
            bgColor: '#f8f8f8',
            textColor: '#666',
            textLoading: '加载中...',
            textDown: '下拉加载更多...',
            textUp: '松开加载更多...'
          }, ret => {
            this.page++
            setTimeout(() => {
              this.getData()
            }, 500)
          })
        }

        if (messages.length === 0 && this.page > 1) {
          toast('没有更多数据了')
        }
      },
      async sendTextMessage (msg) {
        let message = await this.rongCloudClient.setFriendPrivateTextMessage(this.targetUser.juid, msg)
        message.read = 1
        message.readTime = new Date().getTime()
        await insertMessageToDb(message)
        console.log('sendTextMessage', JSON.stringify(message, null, 4))
        this.getLastDatas()

        sendEvent('chat_send_message')
      },
      sendImageMessage (image) {
        console.log('sendImageMessage', image)

        this.rongCloudClient.client.sendImageMessage({
          conversationType: 'PRIVATE',
          targetId: this.targetUser.juid,
          imagePath: image.data,
          extra: ''
        }, async ({ result, status }) => {
          if (status === 'prepare') {
            let { message } = result
            await insertMessageToDb(message)
            this.getLastDatas()
          }
        })
      },
      selectCameraOrPicture () {
        window.api.actionSheet({
          title: '发送图片',
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
        }, (ret, err) => {
          if (ret) {
            this.sendImageMessage(ret)
          }
        })
      },
      async openChatBox () {
        await apiReady()
        const tool = window.api.require('UIChatTools')
        tool.open({
          chatBox: { placeholder: '请输入', autoFocus: false, maxRows: 6 },
          styles: { bgColor: '#F8F8F8', margin: 10 },
          tools: {
            h: 44, iconSize: 30,
            face: {
              normal: 'widget://images/chat/face1.png',
              selected: 'widget://images/chat/face2.png'
            },
            append: {
              normal: 'widget://images/chat/album1.png',
              selected: 'widget://images/chat/album2.png'
            }
          },
          isShowAddImg: false,
          emotions: ['widget://images/chat/emoticons/basic']
        }, ({ eventType, msg }) => {
          if (eventType !== 'send') {
            return
          }
          msg = msg.replace(/\s\t/g, '')
          tool.clearText()
          if (!msg) {
            return toast('请输入')
          }
          this.sendTextMessage(msg)
        })

        tool.toolsListener(({ eventType }) => {
          if (eventType === 'append') {
            this.selectCameraOrPicture()
          }
        })
      },
      formatContent (message) {
        // console.log(JSON.stringify(message, null, 4));
        if (message.objectName === 'RC:TxtMsg') {
          return parseEmojiContent(message.contentText)
        } else if (message.objectName === 'RC:ImgMsg') {
          let contentExtra = null
          try {
            contentExtra = JSON.parse(message.contentExtra)
          } catch (e) {
          }
          if (contentExtra && contentExtra.thumbPath) {
            let path = location.href.indexOf('http') === 0 ? contentExtra.imageUrl : contentExtra.thumbPath
            return `<img src="${path}"/>`
          }
        }

        return '&nbsp;'
      },
      viewDetail (message) {
        console.log(JSON.stringify(message, null, 4))
        if (message.objectName === 'RC:ImgMsg') {
          return this.viewImage(message)
        } else if (message.objectName === 'RC:TxtMsg') {
          let contentExtra = null
          try {
            contentExtra = JSON.parse(message.contentExtra)
          } catch (e) {
            console.error(e)
          }

          if (contentExtra && contentExtra.jpid && contentExtra.pname) {
            return openWindow('project_detail.html', '项目详情', { project: contentExtra })
          }
        }
      }
    },
    viewImage (message) {
      let contentExtra = null
      try {
        contentExtra = JSON.parse(message.contentExtra)
      } catch (e) {
        return
      }
      let path = contentExtra.imageUrl
      if (!path) {
        return
      }

      const photoBrowser = window.api.require('photoBrowser')
      photoBrowser.open({
        images: [path],
        bgColor: '#000'
      }, (ret, err) => {
        if (ret) {
          if (ret.eventType === 'click') {
            photoBrowser.close()
          }
        } else {
          console.error(JSON.stringify(err))
        }
      })
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    html, body, #chat-container-app {
        height: 100%;
        background-color: #ffff;
    }

    .chat-container {
        @containerPaddingLeft: 10px;
        padding: 10px @containerPaddingLeft 100px;
        list-style: none;

        li {
            // @avatarSize: 36px;
            @avatarSize: 0;
            margin-bottom: 10px;
            padding: 0 @avatarSize+2*5px;

            .time-split {
                padding-bottom: 5px;
                text-align: center;

                span {
                    padding: 3px 7px;
                    font-size: 12px;
                    color: #fff;
                    background-color: #c9cee2;
                    border-radius: 5px;
                }
            }

            .avatar {
                position: absolute;
                width: @avatarSize;
                height: @avatarSize;

                img {
                    height: 100%;
                    width: 100%;
                }
            }

            &.friend .avatar {
                left: @containerPaddingLeft;
            }

            &:not(.friend) .avatar {
                right: @containerPaddingLeft;
            }

            .content {
                display: inline-block;
                position: relative;
                padding: 10px 20px;
                max-width: 90%;
                font-size: 15px;
                line-height: 20px;
                border-radius: 4px;

                img.emoji {
                    width: 20px;
                    height: 20px;
                    vertical-align: -5px;
                }

                img:not(.emoji) {
                    max-width: 100%;
                    vertical-align: -8px;
                }

                &:after {
                    position: absolute;
                    content: '';
                    bottom: 0;
                    width: 0;
                    height: 0;
                    border-top: 10px solid transparent;
                    border-bottom: 0 solid transparent;
                }
            }

            &.friend {
                .content {
                    border-radius: 10px 10px 10px 0;
                    color: #22242A;
                    background-color: #F7F8FA;

                    &:after {
                        left: -10px;
                        border-right: 10px solid #F7F8FA;
                    }
                }
            }

            &:not(.friend) {
                text-align: right;

                .content {
                    border-radius: 10px 10px 0 10px;
                    color: #fff;
                    background-color: #6478D3;

                    &:after {
                        right: -10px;

                        border-left: 10px solid #6478D3;
                    }
                }
            }
        }
    }
</style>
