<template>
    <div id="app">
        <user-selector title="项目推送" :list="users" ref="pushProject" multiable v-on:btn-right-click="pushProject"/>
        <user-selector title="项目移交" :list="manageUsers" ref="turnProject" v-on:btn-right-click="turnProject"/>

        <div class="project-container" style="padding-bottom: 0; padding-top: 16px; background: #fff;">
            <div class="project-pic">
              <!-- 假数据 -->
              <img v-if="project.imgUrl != null"  :src="project.imgUrl" alt="" srcset="">
              <img v-else src="../../assets/images/1550230119(1).jpg" alt="" srcset="">
            </div>
            <div class="project-name">
                <div class="project-name-content" v-text="project.pname"></div>
            </div>
            <ul class="project-content-info">
              <li>负&nbsp;&nbsp;责&nbsp;&nbsp;人：
                  <b v-text="userName"></b>
              </li>
              <li>
                  创建时间：
                  <b v-text="formatDate(project.created,'yyyy-MM-dd')"></b>
              </li>
              <li>
                  项目来源： 
                  <b v-text="project.sourceTypeName ? project.sourceTypeName : '暂无'"></b>
              </li>
              <li>
                  {{entrustText}}：
                  <b v-text="(project.entrustDate||'暂无').replace(/(年|月)/g,'-').replace('日','')"></b>
              </li>
              <li>
                  跟踪结果： 
                  <b v-text="trackStatusName"></b>
              </li>
              <li>项目移交： <b v-text="turnStatusName"></b></li>
              <li style="width: 100%">我方单位： <b v-text="project.selfUnitName"></b></li>
              <li style="width: 100%;margin-bottom: 10px">业主单位： <b v-text="project.ownerUnit"></b></li>
              <li v-if="project.status !== 8">合同金额： <b v-text="project.contractMoney"></b></li> 

            </ul>
            <ul class="time-horizontal" :class="project.stage?`project-progress-act-${project.stage}`:''">
                <li class="project-progress project-progress-0">
                    <b></b>
                    <div>生效</div>
                    <div v-if="project.signTime" v-text="formatDate(project.signTime)"></div>
                </li>
                <li class="project-progress project-progress-1">
                    <b></b>
                </li>
                <li class="project-progress project-progress-2">
                    <b></b>
                    <div>完成</div>
                    <div v-if="project.dateLimitText" v-text="project.dateLimitText"></div>
                </li>
            </ul>
            <!-- <div class="project-operas">
                <div class="weui-flex" style="text-align: center">
                    <div class="weui-flex__item">
                        <div class="weui-btn weui-btn_primary project-detail-more-data" @click="shareProject">
                            分享详情
                        </div>
                    </div>
                    <div class="weui-flex__item" v-if="canEditProject">
                        <div class="weui-btn weui-btn_primary project-detail-more-data" @click="toProjectData">
                            更多资料
                        </div>
                    </div>
                    <div class="weui-flex__item">
                        <div class="weui-btn weui-btn_primary project-detail-more-data"
                             @click="$refs.pushProject.show()">
                            推送项目
                        </div>
                    </div>
                </div>
                <div class="weui-flex" style="text-align: center;margin-top: 10px"
                     v-if="canMark || canCreateProject || canTurn">
                    <div class="weui-flex__item" v-if="canMark">
                        <div class="weui-btn weui-btn_primary project-detail-more-data" style="font-size: 12px"
                             @click="toMarkProjectIncharge">
                            指定负责人
                        </div>
                    </div>
                    <div class="weui-flex__item" v-if="canCreateProject">
                        <div class="weui-btn weui-btn_primary project-detail-more-data"
                             @click="cloneProject">
                            项目克隆
                        </div>
                    </div>
                    <div class="weui-flex__item" v-if="canTurn">
                        <div class="weui-btn weui-btn_primary project-detail-more-data"
                             @click="$refs.turnProject.show()">项目移交
                        </div>
                    </div>
                    <div class="weui-flex__item" v-for="show in [canMark ,canCreateProject , canTurn]"
                         v-if="!show"></div>
                </div>
            </div> -->
        </div>
        <!-- <div style="height:8px;background:#dadada;"></div> -->
        <div class="project-detail-more-operations">
            <div class="title">更多操作</div>
        </div>
        <div class="project-container" style="background: #fff;">
            <div class="project-links ">
                <div class="project-link">
                    <div class="btn-animation-ripple" @click="toProjectDetailPage(xmaqPage)">
                        <div class="btn-animation-ripple-content"></div>
                        {{parsePageButtonName(xmaqPage)}}
                    </div>
                </div>
                <div class="project-link weui-flex__item">
                    &nbsp;
                </div>
            </div>
            <div class="project-links " v-for="pages in pageGroups">
                <div class="project-link" v-for="page in pages">
                    <div class="btn-animation-ripple" @click="toProjectDetailPage(page)">
                        <div class="btn-animation-ripple-content"></div>
                        {{parsePageButtonName(page)}}
                    </div>
                </div>
            </div>
            <!-- <div class="more-operate_box">
              
            </div> -->
        </div>
        <div class="project-operas">
            <div class="btn-box" style="text-align: center">
                <div class="share-detail detail-share">
                    <div class="" @click="shareProject">
                        分享详情
                    </div>
                </div>
                <div class="other-btn" v-if="canEditProject">
                    <div class="" @click="toProjectData">
                        更多资料
                    </div>
                </div>
                <div class="other-btn">
                    <div class=""
                          @click="$refs.pushProject.show()">
                        推送项目
                    </div>
                </div>
                
            </div>
            <div class="btn-box" style="text-align: center;margin-top: 10px"
                  v-if="canMark || canCreateProject || canTurn">
                <div class="share-detail detail-share" v-if="canMark">
                    <div class="" style="font-size: 12px"
                          @click="toMarkProjectIncharge">
                        指定负责人
                    </div>
                </div>
                <div class="other-btn" v-if="canCreateProject">
                    <div class=""
                          @click="cloneProject">
                        项目克隆
                    </div>
                </div>
                <div class="other-btn" v-if="canTurn">
                    <div class=""
                          @click="$refs.turnProject.show()">项目移交
                    </div>
                </div>
                <div class="other-btn color-set" v-for="show in [canMark ,canCreateProject , canTurn]"
                      v-if="!show">
                </div>
            </div>
        </div>

        <!-- <div class="safeBg">
          <div class="agreement">
            5165415615156
            <div class="consent"><span class="gou"></span>我已了解安全协议细则</div>
            <div class="button">
              <div class="fh">返回</div>
              <div class="ty">已同意</div>
            </div>
          </div>
          
        </div>
     -->
    
    
    </div>
</template>

<script>
  import _ from 'lodash'
  import MultiSelector from '../../components/MultiSelector'
  import UserSelector from '../../components/UserSelector'
  import {formatDate} from '../../utils/CommonUtils'
  import {
    getPageParams,
    sendEvent,
    addEventListener,
    openWindow,
    toast,
    closeWindow,
    confirm
  } from '../../utils/ApiCloudUtils'
  import {getProject, getProjectShare, modifyProjectShare, removeProject, turnProject} from '../../utils/DataUtils'
  import {getCacheRegisteredUsers, getUserData} from '../../utils/CacheUtils'
  import Wx from '../../utils/WxUtils'

  export default {
    name: 'app',
    components: { MultiSelector, UserSelector },
    data () {
      return {
        xmaqPage:{
          apiUrl: null,
          jreid: 93,
          jrename: "安全管理",
          path: null,
          pid: null,
          routeUrl: "get:/project/{id}/safe",
          type: null,
        },
        project: {
          jpid: '',
          sourceType: '',
          pname: ''
        },
        canEdit: false,
        buttons: [],
        headers: [],
        users: [],
        get inchargeUserMobile () {
          return this.project.userInchargeObject && this.project.userInchargeObject.mobile
        }
      }
    },
    async created () {
      await this.getPageParams()
      addEventListener('layout-showRemoveIcon-click', ({ winName }) => {
        if (winName === window.api.winName) {
          this.removeProject()
        }
      })
      this.viewAppear()
      await this.getData()

      let users = await getCacheRegisteredUsers()
      let { c, d } = await getProjectShare(this.project.jpid)
      let shares = d && d.shares ? d.shares : []

      this.users = users.map(user => {
        return {
          id: user.juid,
          juid: user.juid,
          dpid: user.dpid,
          text: user.juname,
          status: shares.indexOf(user.juid) === -1 ? 'normal' : 'selected'
        }
      })
    },
    computed: {
      entrustText () {
        return this.project.sourceType === 1 ? '委托日期' : '中标日期'
      },
      trackStatusName () {
        switch (this.project.status) {
          case 7:
            return '跟踪中'
          case 8:
            return '跟踪成功'
          case 9:
            return '跟踪失败'
          default:
            return null
        }
      },
      turnStatusName () {
        return this.project.chiefEngineer ? '已移交' : '未移交'
      },
      canTurn () {
        let { status, chiefEngineer } = this.project
        return status === 8 && chiefEngineer === 0 && this.buttons.includes('turn-project')
      },
      canMark () {
        const { status } = this.project
        const { dpid } = getUserData()
        return status === 8 && dpid === 5
      },
      canCreateProject () {
        return this.buttons.includes('create-project')
      },
      canEditProject () {
        return this.buttons.includes('get:/project/{id}/edit')
      },
      pageGroups () {
        console.log(this.headers)
        return _.chunk(this.headers, 3)
      },
      manageUsers () {
        return this.users.filter(({ dpid }) => dpid === 5)
      },
      userName () {
        if (this.project.status === 8) {
          return this.project.userInchargeObject && this.project.userInchargeObject.juname || '未指定负责人'
        } else {
          return this.project.userDevelopObject && this.project.userDevelopObject.juname || '未指定负责人'
        }
      }
    },
    methods: {
      formatDate,
      viewAppear () {
        addEventListener('layout-windowViewAppear', ({ winName }) => {
          if (winName !== window.api.winName) {
            return
          }
          this.getData()
        })
      },
      async getPageParams () {
        let { project } = await getPageParams()
        this.project = project
      },
      async getData () {
        let { c, d } = await getProject(this.project.jpid)
        if (c !== 0) {
          return
        }
        let { project, buttons, headers, canEdit } = d
        this.project = project
        this.buttons = buttons
        this.canEdit = canEdit
        const showItems = [19, 28, 62]
        this.headers = headers.filter(header => showItems.includes(header.jreid) || project.status === 8)
        sendEvent('layout-showRemoveIcon', {
          winName: window.api.winName,
          show: project.canEdit && buttons.includes('remove-project')
        })
      },
      async removeProject () {
        if (!await confirm('删除后无法恢复，确认删除项目？')) {
          return
        }

        let { c, m } = await removeProject(this.project.jpid)
        if (c !== 0) {
          return
        }

        toast(m)
        setTimeout(() => {
          closeWindow()
        }, 300)
      },
      toProjectDetailPage ({ jreid, jrename }) {
        let params = { project: this.project }
        switch (jreid) {
          case 19:
            return openWindow('project_track.html', jrename, params)
          case 24:
            return openWindow('project_progress.html', jrename, Object.assign({ type: 'impl' }, params))
          case 28:
            return openWindow('project_progress.html', jrename, Object.assign({ type: 'contract' }, params))
          case 31:
            return openWindow('project_member.html', jrename, params)
          case 35:
            return openWindow('project_income.html', jrename, params)
          case 39:
            return openWindow('project_invoice.html', jrename, params)
          case 43:
            return openWindow('project_spend.html', jrename, params)
          case 62:
            return openWindow('project_records.html', jrename, params)
          case 93:
            return openWindow('project_safe.html', jrename, params)
        }
      },
      buildColor ({ jreid }) {
        switch (jreid) {
          case 19:
          case 28:
          case 35:
          case 39:
          case 43:
          case 62:
            return `background-color: #ff9e00;`
          case 31:
          case 24:
            return `background-color: #238a32;`
        }
      },
      shareProject () {
        new Wx().shareWebPage(this.project)
      },
      toProjectData () {// 项目资料
        openWindow('project_add.html', '项目资料', { edit: true, project: this.project, canEdit: this.canEdit })
      },
      cloneProject () {// 克隆项目
        openWindow('project_add.html', '项目资料', { edit: true, project: this.project, canEdit: true, clone: true })
      },
      toProjectProgress () {// 项目进度
        openWindow('project_progress.html', '项目状态管理', { project: this.project })
      },
      toProjectMember () {// 人员管理
        openWindow('project_member.html', '项目参与人员管理', { project: this.project })
      },
      toProjectIncome () {// 进款统计
        openWindow('project_income.html', '项目进款统计', { project: this.project })
      },
      toProjectInvoice () {// 开票情况
        openWindow('project_invoice.html', '项目开票情况', { project: this.project })
      },
      toProjectActivity () {// 项目活动
        openWindow('project_activity.html', '项目活动表', { project: this.project })
      },
      toProjectSpend () {// 项目活动
        openWindow('project_spend.html', '项目支出表', { project: this.project })
      },
      toMarkProjectIncharge () {// 指定项目负责人
        openWindow('project_mark_incharge.html', '指定项目负责人', { project: this.project })
      },
      async pushProject (users) {
        let selectedId = users.map(user => user.id)
        this.users.forEach(user => {
          user.status = selectedId.indexOf(user.juid) === -1 ? 'normal' : 'selected'
        })

        let { c, m } = await modifyProjectShare(this.project.jpid, selectedId)
        if (c === 0) {
          toast(m)
        }
      },
      async turnProject ({ id }) {
        let { c, m } = await turnProject(this.project.jpid, id)
        if (c === 0) {
          this.project.chiefEngineer = id
          toast(m)
        }
      },
      parsePageButtonName ({ jreid, jrename }) {
        return jreid === 31 ? '人员管理' : jrename
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";
    .safeBg{
      position: fixed;
      top:0;
      bottom:0;
      left:0;
      right:0;
      background:rgba(0,0,0,0.5);
      z-index: 100;
      .agreement{
        position: absolute;
        top:100px;
        left:50px;
        right:50px;
        bottom:200px;
        background:#fff;
      }
      .consent{
        position: absolute;
        bottom:0px;
        .gou{
          display:inline-block;
          width:20px;
          height:20px;
          border:1px solid #000;
        }
      }
      .button{
        position: absolute;
        bottom:-10px;
        left:0;
        right:0;
        .fh{
          left:0px;
          width:100px;
          line-height: 50px;
          background:red;
        }
        .ty{
          right:0px;
          width:100px;
          line-height: 50px;
          background:red;
        }
      }
    }

    body {
        background: #fafafc;
    }

    /*横向时间轴*/
    .time-horizontal {
        position: relative;
        list-style-type: none;
        padding: 0 8px;
        padding-bottom: 33px;
        margin: 0;
        margin-top: 5px;
        height: 78px;
        display: flex;
        display: -webkit-flex;
        -webkit-border-radius: 5px;
        -moz-border-radius: 5px;
        border-radius: 5px;
        background-color: #ffffff;

        li {
            position: relative;
            border-bottom: 2px solid #cccccc;
            float: left;
            text-align: left;
            flex: 1;
            padding-bottom: 10px;

            &:before,
            &:last-child:after {
                position: absolute;
                content: ' ';
                top: -5px;
                width: 8px;
                height: 8px;
                -webkit-border-radius: 50%;
                -moz-border-radius: 50%;
                border-radius: 50%;
            }

            &:before {
                left: 0;
            }

            &:last-child:after {
                right: 0;
            }

            &.project-progress-0:before {
                // background-color: @baseColor;
            }

            &.project-progress-1:before {
                // background-color: @baseColor;
            }

            &.project-progress-2:before {
                // background-color: #3dcf7b;
            }

            &.project-progress-2:after {
                // background-color: #ef376e;
            }

            div {
                font-size: 11px;
                color: rgb(127, 127, 127);
            }

            &.project-progress-2 div {
                text-align: right;
            }
        }

        &.project-progress-act-1 .project-progress-0,
        &.project-progress-act-2 .project-progress-0,
        &.project-progress-act-3 .project-progress-0 {
            border-bottom-color: #3dcf7b;
        }

        &.project-progress-act-2 .project-progress-1,
        &.project-progress-act-3 .project-progress-1 {
            border-bottom-color: #3dcf7b;
        }

        &.project-progress-act-3 .project-progress-2 {
            border-bottom-color: #3dcf7b;
        }

        &.project-progress-act-0 .project-progress-0:before,
        &.project-progress-act-1 .project-progress-1:before,
        &.project-progress-act-2 .project-progress-2:before {
            top: -9px;
            left: -5px;
            height: 16px !important;
            width: 16px !important;
        }

        &.project-progress-act-3 .project-progress-2:after {
            top: -9px;
            height: 16px !important;
            width: 16px !important;
        }
    }

    .project-container {
        padding: 0 5.5% 11px;

        .project-pic {
          width: 100%;
          height: 160px;
          border-radius: 10px;
          background: pink;
          img {
            width: 100%;
            height: 100%;
            border-radius: 10px;
          }
        }

        .project-name {
            position: relative;
            // padding-left: 26px;
            padding-top: 20px;
            padding-bottom: 20px;
            font-size: 16px;
            letter-spacing: 1px;
            line-height: 24px;
            color: #22242A;

            // &:before {
            //     position: absolute;
            //     content: ' ';
            //     left: 11px;
            //     top: 20.5px;
            //     width: 5.5px;
            //     height: 22px;
            //     background: rgb(63, 103, 233);
            //     -webkit-border-radius: 3.8px;
            //     -moz-border-radius: 3.8px;
            //     border-radius: 3.8px;
            // }
        }

        .project-operas {
            margin-top: 8px;
            // margin-bottom: 15px;
            padding-bottom: 15px!important;

            
            

            .weui-btn {
                display: inline-block;
                width: 90px;
                height: 28px;
                line-height: 28px;
                font-size: 13px;
                -webkit-border-radius: 14px;
                -moz-border-radius: 14px;
                border-radius: 14px;
                color: #fff;
                box-shadow: 0 2px 3px rgba(122, 122, 122, 0.33);
                background-color: #3dcf7b;

                &:active {
                    background-color: #34ac65;
                }

                &:after {
                    border: none;
                }
            }
        }

        .project-links {
            padding-bottom: 10px;
            text-align: center;

            .project-link {
                @linkSize: 80px;
                width: 100%;

                .btn-animation-ripple {
                    // display: inline-block;
                    padding: 0 8px;
                    box-sizing: border-box;
                    width: 100%;
                    height: 62px;
                    line-height: 62px;
                    text-align: left;
                    font-size: 14px;
                    color: #22242A;
                    // background-color: @baseColor;
                    // -webkit-border-radius: 19px;
                    // -moz-border-radius: 19px;
                    // border-radius: 19px;
                    // box-shadow: 0 2px 3px rgba(63, 103, 233, 0.4);
                    border-bottom: 1px solid #F1F3F8;
                    -ms-word-break: break-all;
                    word-break: break-all;
                    &::after {
                      
                        position: absolute;
                        content: ' ';
                        right: 5px;
                        top: 50%;
                        width: 8px;
                        height: 8px;
                        margin-top: -5px;
                        border-right: 2px solid #CDCDD7;
                        border-bottom: 2px solid #CDCDD7;
                        -webkit-transform: rotate(-45deg);
                        -moz-transform: rotate(-45deg);
                        -ms-transform: rotate(-45deg);
                        -o-transform: rotate(-45deg);
                        transform: rotate(-45deg);
                      
                    }

                    .btn-animation-ripple-content {
                      font-size: 14px;
                      color: #22242A;
                    }
                }
            }
        }
    }

    .project-content-info {
        list-style: none;
        padding: 0 11px;

        li {
            display: inline-block;
            width: 49%;
            line-height: 30px;
            font-size: 12px;
            color: #8D92A3;

            b {
                font-size: 12px;
                color: #22242A;
                font-weight: normal;
            }
        }
    }

    .project-detail-more-data {
        background-color: @baseColor !important;

        &:active {
            background-color: @baseColorActive !important;
        }
    }

    .project-detail-more-operations {
      background: #fff;
        .title {
            position: relative;
            padding: 0 22px;
            font-size: 11px;
            color: #8D92A3;

            // &:after {
            //     position: absolute;
            //     content: '';
            //     bottom: 0;
            //     left: 0;
            //     right: 0;
            //     height: 1px;
            //     background: rgb(218, 218, 218);
            //     -webkit-transform: scaleY(0.5);
            //     -moz-transform: scaleY(0.5);
            //     -ms-transform: scaleY(0.5);
            //     -o-transform: scaleY(0.5);
            //     transform: scaleY(0.5);
            // }
        }
    }

    .btn-box {
      padding: 0 20px 20px;
      display: flex;
      justify-content: space-between;
      .share-detail, .other-btn {
        height: 46px;
        line-height: 46px;
        font-size: 14px;
        color: #FFFFFF;
        border-radius: 23px;
      }

      .share-detail {
        width: 40%;
        background: #6478D3;
      }
      .detail-share {

      }
      .other-btn {
        width: 23%;
        background: #CDCDD7; 
      }
      .color-set {
        background: transparent;
      }
    }

    


    
</style>
