<template>
    <div id="app">
        <div>
            <ul class="register-users-select-container">
                <li v-for="(item,index) in unreadList" :key="index" @click="toChat()">
                    <img :src="item.avatarUrl"/>
                    <div class="unread_point" v-show="item.notifyCount != 0">{{item.notifyCount}}</div>
                    <font>{{item.juname}}</font>
                    <span v-text="formatDate(item.newMessageCreated*1000,'yyyy-MM-dd hh:mm:ss')"></span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
  import {notifyCount} from '../../utils/DataUtils'
  import {formatDate, clearStorage} from '../../utils/CommonUtils'
  import {addEventListener, apiReady, openWindow, sendEvent, getPageParams} from '../../utils/ApiCloudUtils'

  export default {
    name: 'smallTalk',
    components: {},
    data () {
      return {
        unreadList:[]   
      }
    },
    async created () {
      this.getMessageList()
 
    },
    methods: {
      formatDate,
      async getMessageList(){
        let {c,d} = await notifyCount()
        this.unreadList = d
        console.log(this.unreadList)
        // setTimeout(() => {
        //   this.getMessageList()
        // }, 2000)
        
      },
      toChat(){
        
          // openWindow('chat.html', this.selectedUser.juname, {
          //   selectedUser:this.selectedUser,
          //   openChatBox: true,
          //   showAvatar: { url: this.selectedUser.avatarUrl }
          // })
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .register-users-select-search {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        padding: 10px 52px 10px 22px;
        z-index: 999;
        background: #fff;

        & > input {
            padding-left: 10px;
            height: 35px;
            line-height: 35px;
            width: 100%;
            border: 1px solid #eee;
            border-radius: 8px;
        }

        &:before {
            position: absolute;
            content: '';
            right: 22px;
            top: 10px;
            width: 20px;
            height: 33px;
            background-image: data-uri('image/png;base64', '../../assets/images/Search.png');
            background-size: 20px auto;
            background-repeat: no-repeat;
            background-position: center;
        }
    }

    .register-users-select-title {
        margin-bottom: 10px;
        height: 30px;
        line-height: 30px;
        padding: 0 22px;
        font-size: 20px;
        color: #22242A;
        font-weight: 900;
    }

    .register-users-select-container {
        list-style: none;

        li {
            position: relative;
            padding: 20px 22px 20px 83px;
            height: 88px;

            & > img {
                position: absolute;
                left: 22px;
                top: 20px;
                height: 48px;
                width: 48px;
                border-radius: 50%;
                -webkit-border-radius: 50%;
            }

            font {
                display: block;
                color: #22242a;
                font-size: 14px;
                line-height: 22px;
                margin-bottom: 3px;
            }

            span {
                display: block;
                font-size: 12px;
                line-height: 22px;
                color: #8d92a3;
            }

            &:after {
                position: absolute;
                content: '';
                left: 83px;
                right: 20px;
                bottom: 0;
                height: 1px;
                background: #eee;
                -webkit-transform: scaleY(0.5);
                -moz-transform: scaleY(0.5);
                -ms-transform: scaleY(0.5);
                -o-transform: scaleY(0.5);
                transform: scaleY(0.5);
            }

            &.active:before {
                position: absolute;
                content: '';
                right: 20px;
                top: 50%;
                height: 30px;
                width: 30px;
                margin-top: -15px;
                background-image: data-uri('image/png;base64', '../../assets/images/icon-right.png');
                background-size: 15px auto;
                background-position: center;
                background-repeat: no-repeat;
            }

            &:last-child:after {
                display: none;
            }

            &.disabled {
                display: none;
                background-color: rgba(230, 230, 230, 0.62);
            }

            &:not(.disabled):active {
                background-color: #eee;
            }
        }
        .unread_point{
          position: absolute;
          width: 15px;
          line-height: 14px;
          background: red;
          font-size: 12px;
          text-align: center;
          border-radius: 50%;
          color: #fff;
          left: 63px;
          top: 15px;
          z-index: 10;
        }
    }
</style>
