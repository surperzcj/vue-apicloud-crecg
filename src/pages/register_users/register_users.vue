<template>
    <div id="app" style="padding-top: 55px;">
        <div class="register-users-select-search">
            <input type="text" placeholder="请输入名字搜索" v-model="searchName"/>
        </div>
        <div v-for="department in departmentUsers" v-if="department">
            <div class="register-users-select-title" v-text="department.dpname"></div>
            <ul class="register-users-select-container">
                <li v-for="user in department.users"
                    :class="(selectedUserId === user.juid?'active':'') + (selfId === user.juid?'disabled':'')"
                    @click="selectUser(user)">
                    <img :src="user.avatarUrl"/>
                    <font>{{user.juname}}</font>
                    <span v-text="user.mobile"></span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
  import {apiReady, closeWindow, openWindow, getPageParams, sendEvent, toast, addEventListener} from '../../utils/ApiCloudUtils'
  import {getCacheRegisteredUsers, getUserData} from '../../utils/CacheUtils'

  export default {
    name: 'app',
    components: {},
    data () {
      return {
        get selectedUserId () {
          if (this.selectedUser) {
            return this.selectedUser.juid
          }

          return 0
        },
        selectedUser: null,
        users: [],
        searchName: [],
        selfId: null,
        get searchedUsers () {
          return this.users.filter(u => u.juname.indexOf(this.searchName) > -1)
        },
        get departmentUsers () {
          let groups = []

          for (let i = 0; i < this.searchedUsers.length; i++) {
            let user = this.searchedUsers[i]
            let { dpid, dpname } = user
            if (groups[dpid] === void 1) {
              groups[dpid] = {
                dpid,
                dpname,
                users: [user]
              }
            } else {
              groups[dpid].users.push(user)
            }
          }

          return groups
        }
      }
    },
    async created () {
      this.getData()

      let { userId } = getUserData()
      this.selfId = userId

      await apiReady()
      // sendEvent('layout-showBtnRight', {
      //   winName: window.api.winName,
      //   btnRight: {
      //     text: '选择'
      //   }
      // })

      addEventListener('layout-btnRight-click', async value => {
        if (window.api.winName !== value.winName) {
          return
        }

        if (!this.selectedUserId) {
          return toast('请选择一个人员')
        }

        let { winName, timeToCloseWindow } = await getPageParams()

        sendEvent('register_users_selected', {
          winName,
          selectedUser: this.selectedUser
        })

        setTimeout(() => {
          closeWindow()
        }, timeToCloseWindow)
      })
    },
    methods: {
      async getData () {
        this.users = await getCacheRegisteredUsers()
        console.log(this.departmentUsers)
      },
      selectUser (user) {
        if (user.juid === this.selfId) {
          return
        }

        this.selectedUser = user
        openWindow('chat.html', this.selectedUser.juname, {
          selectedUser:this.selectedUser,
          openChatBox: true,
          showAvatar: { url: this.selectedUser.avatarUrl }
        })
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

            // &.active:before {
            //     position: absolute;
            //     content: '';
            //     right: 20px;
            //     top: 50%;
            //     height: 30px;
            //     width: 30px;
            //     margin-top: -15px;
            //     background-image: data-uri('image/png;base64', '../../assets/images/icon-right.png');
            //     background-size: 15px auto;
            //     background-position: center;
            //     background-repeat: no-repeat;
            // }

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
    }
</style>
