<template>
    <div id="app">
      <div class="nav">
              <div class="nav-box">
                <div class="nav-push" @click="clickNav(1)">已推送
                  <div class="border_blue" v-show="isNav == 1"></div>
                </div>
                <div class="nav-pull" @click="clickNav(2)">已接收
                  <div class="border_blue" v-show="isNav == 2"></div>
                </div>
              </div>
            </div>
        <div class="empty-message" v-if="isEmpty">
            <img src="../../assets/images/empty-messages.png">
            <div>暂无消息内容</div>
        </div>
        <ul class="messages-container" v-else>
            <li v-for="(item,index) in list" :key='index' @click="goDetail(item.jpid,item.jppid,index)">
              <div class="title" :class="{read_color:item.isRead === 1}">{{item.pname}}</div>
              <div>
                <span class="name" v-if="isNav == 1">推送对象：{{item.toUserName}}</span>
                <span class="name" v-if="isNav == 2">发送人：{{item.formUserName}}</span>
                <span class="time" v-text="formatDate(item.created*1000,'yyyy-MM-dd hh:mm:ss')"></span>
              </div>
              <div class="dian" >
                <img style="width:100%;" @click.stop="delPush(item.jppid,index)" src="../../assets/images/3dian.png" alt="">
              </div>
            </li>
        </ul>
    </div>
</template>

<script>
  import {getProjectsPush, getProject, removePush, readPush, messagePush} from '../../utils/DataUtils'
  import {getUserMessages, markTargetUserMessageAllRead} from '../../utils/Sqlite'
  import {addEventListener, apiReady, openWindow, sendEvent, listenPage, confirm, toast} from '../../utils/ApiCloudUtils'
  import {getCacheRegisteredUsers, getCacheUserById} from '../../utils/CacheUtils'
  import {diffTimestampFormat, formatDate, parseEmojiContent} from '../../utils/CommonUtils'

  export default {
    name: 'app',
    components: {},
    data () {
      return {
        messages: [],
        isNav:1,
        users: [],
        list: [],
        form:{
          pageNumber: 1,
          total: 0,
          type:1
        },
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
      // sendEvent('layout-showBtnRight', {
      //   winName: window.api.winName,
      //   btnRight: {
      //     text: '+',
      //     style: 'font-size:28px;'
      //   }
      // })
    },
    methods: {
      formatDate,
      async goDetail(jpid,id,index){
        let res = await getProject(jpid)
        await readPush(id)
        this.list[index].isRead = 1
        let project = res.d.project
        openWindow('project_detail.html', '项目详情', { project })

      },
      formatTime (ts) {
        let diff = (this.currentTimestamp - parseInt(ts)) / 1000
        return diffTimestampFormat(diff, ts)
      },
      async delPush(id,index){
        if (!await confirm('确认删除该消息吗？')) {
          return
        }
        let { c, m } = await removePush(id)
        toast(m)
        if (c === 0) {
          this.list.splice(index, 1)
        }
      },
      clickNav(type){
        if(type === this.isNav){  //防止多次触发
          return
        }
        this.isNav = type
        this.form = {
          pageNumber: 1,
          total: 0,
          type:type
        }
        this.getData(type)
      },
      async getData (type) {
        let params = Object.assign({}, this.form)

        let { c, d } = await getProjectsPush(params)
        
        if (c !== 0) {
          return
        }
        
        let { rows, pages, total, extras, currentPage } = d
        this.list = this.form.pageNumber === 1 ? rows : this.list.concat(rows)
        console.log('this.list')
        console.log(this.list)
        this.form.total = total

        if (this.form.pageNumber < pages) {
          listenPage(() => {
            this.form.pageNumber++
            this.getData()
          })
        }
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
        return this.list.length === 0
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";
    .nav{
      background:#fff;
      padding:10px 0;
      position: fixed;
      top:0;
      left:0;
      right:0;
      z-index: 100;
      .nav-box{
        display: flex;
        border-radius: 5px;
        margin: 0px auto;
        height: 35px;
        font-size:14px;
        .nav-push,.nav-pull{
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50%;
          position:relative;
        }
      }
    }
    .border_blue{
      position: absolute;
      width: 15px;
      height: 2px;
      border-radius: 2px;
      background: #6478D3;
      color: #6478D3;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }

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
        padding-top: 56px;
        li {
          .title {
              padding-right: 60px;  
          }
          .name {
              color: #8D92A3;
              font-size: 12px;
              line-height: 22px;
          }

          .time {
              font-size: 10px;
              color: #8D92A3;
              letter-spacing: 1px;
              text-align: right;
              line-height: 17px;
              padding-left: 20px;
          }
          .dian{
            position: absolute;
            right: 20px;
            top: 22px;
            width: 40px;
            padding: 0 10px;
          }
          .read_color{
            color:#999;
          }
            &:not(.messages-new) {
                position: relative;
                padding: 20px;

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
                left: 20px;
                right: 20px;
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
