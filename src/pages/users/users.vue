<template>
    <div id="app">
        <!-- <ul class="users-departments">
            <li :class="h.active?'active':''" v-for="(h,headerIndex) in headers" v-text="h.dpname"
                @click="tabHeader(headerIndex)"></li>
        </ul> -->
        <div class="projects-sorts" @click="selectingReturn = !selectingReturn" :class="{active: selectingReturn}">{{clearMoneyName}}<span class="jiantou"></span></div>
        <ul class="users-container">
            <li @click="toUserDetail(row)" v-for="(row,index) in form.rows" :key="index" class="btn-animation-ripple">
                <div class="btn-animation-ripple-content"></div>
                <div class="users-avatar">
                    <img :src="row.avatarUrl" alt="">
                </div>
                <div class="users-info" style="padding-bottom: 5px;">
                  <div class="users-name" v-text="row.juname"></div>
                  <div style="text-align: right; padding-top: 5px;">
                    <div class="users-status_color" :class="row.status === 1 ? 'users-status_color_use' : 'users-status_color_disable'"></div>
                    <span class="users-status"  v-text="row.statusName"></span>
                  </div>
                </div>
                <div class="users-info">
                    <div class="users-mobile"><span v-text="row.mobile"></span></div>
                </div>
            </li>
        </ul>
        <transition name="slide-fade">
          <ul class="select-container" v-if="selectingReturn" :class="{bounceInDown: selectingReturn}">
            <li :class="h.active?'active':''" :key="headerIndex" v-for="(h,headerIndex) in headers" v-text="h.dpname"
              @click="tabHeader(headerIndex)">
            </li>
          </ul>
        </transition>
        <div class="weui-mask" @touchmove.prevent
          @click="selectingReturn = false"
          v-if="selectingReturn">
        </div>
    </div>
</template>

<script>
  import {
    openWindow,
    listenPage,
    addEventListener,
    pullRefresh,
    pullRefreshDone
  } from '../../utils/ApiCloudUtils'
  import {getManageUsers, turnProject} from '../../utils/DataUtils'
  import {DEPARTMENTS} from '../../ProjectContants'

  export default {
    name: 'users',
    components: {},
    data () {
      let departments = [
        { dpid: 0, dpname: '全部' }
      ]
      departments = departments.concat(DEPARTMENTS)

      return {
        clearMoneyName:'全部',
        headers: departments,
        buttons: [],
        form: {
          page: 1,
          departmentId: 0,
          rows: []
        },
				selectingReturn:false
      }
    },
    async created () {
      this.tabHeader(0)

      pullRefresh(async () => {
        this.form.page = 1
        this.form.rows = []
        await this.getData()
        pullRefreshDone()
      })

      addEventListener('root-users-scroll', () => {
        this.form.page = 1
        this.getData()
      })
    },
    methods: {
      tabHeader (index) {
        this.selectingReturn = false
        this.headers.forEach((header, headerIndex) => {
          header.active = index === headerIndex
          header.active && (this.form.departmentId = header.dpid)
          if(header.active){
						this.clearMoneyName = header.dpname
					}
        })
        this.form.page = 1
        this.getData()
      },
      toUserDetail (user) {
        openWindow('user_detail.html', '用户详情', {
          user,
          isUserManagement: true,
          buttons: this.buttons
        })
      },
      async getData () {
        let { c, d } = await getManageUsers('', this.form.departmentId, this.form.page, true)
        if (c !== 0) return

        let { rows, pages } = d.users
        this.buttons = d.buttons
        this.form.rows = (this.form.page === 1 ? [] : this.form.rows).concat(rows)

        if (this.form.page < pages) {
          this.form.page++
          listenPage(this.getData.bind(this))
        }
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .slide-fade-enter-active {
      transition: all .2s ease;
    }
    .slide-fade-leave-active {
      transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    }
    .slide-fade-enter, .slide-fade-leave-to
    /* .slide-fade-leave-active for below version 2.1.8 */ {
      transform: translateY(-10px);
      opacity: 0;
    }


    .users-departments {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 70px;
        z-index: 100;
        overflow: auto;
        background: #f8f8f8;
        

        li {
            line-height: 64px;
            padding-left: 4.5%;
            padding-right: 4.5%;
            border-bottom: 1px #fff solid;
            font-size: 12px;
            color: #22242A;
            text-align: center;

            &.active {
                background: #fff;
                box-shadow: inset 3px 0 0 0 #6478D3;
            }

        }

        
    }
    .users-container {
        margin-top:42px;
        .users-avatar {
          border-radius: 48px;
          width: 48px;
          height: 48px;

          img {
            border-radius: 48px;
          }
        }

        li:before {
            display: none;
        }

        .users-mobile {
            position: relative;
            // padding-left: 16px;
            font-size: 12px;
            color: #8D92A3; 

            // &:before {
            //     position: absolute;
            //     content: '';
            //     left: 0;
            //     top: 0;
            //     height: 100%;
            //     width: 16px;
            //     background-image: data-uri('iamge/png;base64', '../../assets/images/icon-user-mobile.png');
            //     background-repeat: no-repeat;
            //     background-size: 10px;
            //     background-position: center left;
            // }
        }
        .users-status {
          color: #8D92A3;
        }
        .users-status_color {
          width: 10px;
          height: 10px;
          display: inline-block;
          border-radius: 50%;
          margin-right: 5px;
          font-size: 12px;
          color: #8D92A3;
        }
        .users-status_color_use {
          background: #51DC8E;
        }
        .users-status_color_disable {
          background: #CDCDD7;
        }
    }
    .projects-sorts {
      position: fixed;
      right: 0;
      left:0;
      top: 0;
      text-align: center;
      color: #070505;
      line-height: 42px;
      font-size: 13px;
      z-index: 1002;
      height: 42px;
      background-color: #fff;
      &:after {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 1px;
        content: '';
        background-color: #d4d4d3;
        -webkit-transform: scaleY(0.5);
        -moz-transform: scaleY(0.5);
        -ms-transform: scaleY(0.5);
        -o-transform: scaleY(0.5);
        transform: scaleY(0.5);
      }
    }   
    .select-container {
      position: fixed;
      top: 42px;
      left: 0;
      right: 0;
      background-color: white;
      z-index: 1001;
      border-radius: 5px;
      li {
      font-size: 13px;
      line-height: 42px;
      text-align: center;

      &.active {
        color: @baseColor;
      }
      }
    }
    .jiantou{
	  	display: inline-block;
      margin-left: 4px;
      width: 8px;
      height: 8px;
      border-right: 1px solid #0e0e0e;
      border-bottom: 1px solid #0e0e0e;
      vertical-align: 2px;
      -webkit-transform: rotate(45deg);
      transform: rotate(45deg);
	  }
    .active span{
      vertical-align: -1px;
      transform: rotate(225deg);
    } 
    .users-container{
      
    }
</style>
