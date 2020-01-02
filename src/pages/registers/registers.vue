<template>
    <div id="app" class="layout-subtitle-fix">
        <ul class="layout-subtitle">
            <li class="register-check" :class="h.active?'activee':''" v-for="(h,headerIndex) in headers" v-text="h.name"
                @click="tabHeader(headerIndex)"></li>
        </ul>
        <ul class="users-container" v-if="form.rows.length > 0">
            <li @click="toUserDetail(row)" v-for="row in form.rows" class="btn-animation-ripple">
                <div class="btn-animation-ripple-content"></div>
                <div class="user-header">
                  <img src="http://apppicture.bjtkcloud.com/user_avatar_default" alt="">
                </div>
                <div class="user-data">
                  <div class="users-name" v-text="row.juname"></div>
                  <div class="users-info">
                    <div><span class="users-status" style="color: #8D92A3;" v-text="row.department&&row.department.dpname"></span></div>
                      <div style="padding-left: 10px; color: #8D92A3;">{{row.mobile}}</div>
                  </div>
                </div>
            </li>
        </ul>
        <div class="content-box" v-else>
          <img src="../../assets/images/nocontent.png" alt="" srcset="">
          <p>暂无需要审批的内容</p>
        </div>
    </div>
</template>

<script>
  import {openWindow, pullRefreshDone, pullRefresh, listenPage} from "../../utils/ApiCloudUtils";
  import {getUserRegisterApproves} from "../../utils/DataUtils";

  export default {
    name: 'registers',
    data() {
      return {
        headers: [
          {name: '全部', active: false, status: null},
          {name: '待审批', active: false, status: 0},
          {name: '已审批', active: false, status: 1},
        ],
        form: {
          page: 1,
          status: 0,
          rows: []
        },
        buttons: []
      }
    },
    created() {
      this.tabHeader(0);

      pullRefresh(async () => {
        this.form.page = 1;
        this.form.rows = [];
        await this.getData();
        pullRefreshDone();
      });
    },
    methods: {
      tabHeader(index) {
        this.headers.forEach((header, headerIndex) => {
          if (index === headerIndex) {
            header.active = true;
            this.form.status = header.status;
          } else {
            header.active = false;
          }
        });
        this.form.page = 1;
        this.getData();
      },
      toUserDetail(user) {
        openWindow('user_detail.html', '用户详情', {
          user,
          isUserManagement: false,
          buttons: this.buttons
        });
      },
      async getData() {
        let {c, m, d} = await getUserRegisterApproves('', this.form.status, this.form.page, true);
        pullRefreshDone();
        if (c !== 0) {
          return;
        }

        let {rows, pages} = d.users;
        this.buttons = d.buttons;
        this.form.rows = (this.form.page === 1 ? [] : this.form.rows).concat(rows);
        // this.form.rows = [];
        console.log("数据", this.form.rows)
        if (this.form.page < pages) {
          this.form.page++;
          listenPage(() => {
            this.getData();
          });
        }
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";
    .register-check {
      background-color: #fff!important;
      color: #8D92A3 ;
    }
    .activee {
      position: relative;
      color: #22242A;
      &::after {
        position: absolute;
        content: '';
        left: 50%;
        margin-left: -7px;
        // right: 22px;
        bottom: 0;
        height: 2px;
        background: #6478D3;
        -webkit-transform: scaleY(0.5);
        -moz-transform: scaleY(0.5);
        -ms-transform: scaleY(0.5);
        -o-transform: scaleY(0.5);
        transform: scaleY(0.5);
        width: 15px;
      }
    }
    .btn-animation-ripple {
      &::before {
        content: none!important;
      }
      .user-header {
        width: 48px;
        height: 48px;
        // background: pink;
        border-radius: 24px;
        float: left;
        img {
          width: 100%;
          border-radius: 50%;
        }
      }
      .user-data {
        float: left;
        padding-left: 20px;
        color: #8D92A3;
      }
    }
    .content-box {
      height: 100%;
      // background: pink
      text-align: center; 
      img {
        width: 200px;
        height: 200px;
        margin-top: 100px;
      }
      p {
        font-size: 14px;
        color: #8D92A3;
      }
    }
</style>
