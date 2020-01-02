<template>
    <div id="app">
        <MultiSelector :list="changeDepartments" title="选择部门" v-model="selectedItem" ref="dps"/>
        <div class="user-form">
            <div class="user-form-header_box">
              <div class="header-box_img">
                <img :src="user.avatarUrl" alt="" srcset="">
              </div>
            </div>
            <div class="user-form-item">
                用户名称
                <span v-text="user.juname" style="color: #22242A"></span>
            </div>
            <div class="user-form-item">
                用户账号
                <span v-if="user.principal">(负责人)</span><span v-text="user.mobile" style="color: #22242A"></span>
            </div>
            <div class="user-form-item"
                 :class="{editable: canChangeDepartment, 'btn-animation-ripple': canChangeDepartment}"
                 @click="canChangeDepartment && $refs.dps.show()">
                <div class="btn-animation-ripple-content" v-if="canChangeDepartment"></div>
                所属部门
                <span v-text="user.department&&user.department.dpname"></span>
            </div>
            <div class="user-form-item" v-if="isUserManagement">
                账号状态
                <span>
                    <span v-text="statusName" v-if="!hasActivePower"></span>
                    <input class="weui-switch" type="checkbox" v-model="active" v-else/>
                </span>
            </div>
            <div class="user-form-item" v-if="!isUserManagement">
                是否通过
                <span>
                    <input class="weui-switch" type="checkbox" v-model="active"
                           v-if="userCanApply && hasApplyRegisterPower"/>
                    <span v-text="applyStatusName" v-else></span>
                </span>
            </div>
            <div class="user-form-item user-form-item-reset btn-animation-ripple" @click="resetPassword"
                 v-if="hasResetPasswordPower">
                <div class="btn-animation-ripple-content"></div>
                重置密码
                <span class="right-arrow"></span>
            </div>
            <!-- <div class="user-form-buttons" v-if="canSave">
                <a href="javascript:;" class="weui-btn weui-btn_mini weui-btn_primary" @click="save">保存修改</a>
                <a href="javascript:;" class="weui-btn weui-btn_mini weui-btn_default" @click="closeWindow">取消修改</a>
            </div> -->
        </div>
        <div v-if="isUserManagement" class="incharge-projects-title">负责项目</div>
        <ProjectItem :rows="projects" v-if="isUserManagement"/>
        <div class="user-form-buttons" v-if="canSave">
            <a href="javascript:;" class="weui-btn weui-btn_mini weui-btn_primary" @click="save">确认修改</a>
            <a href="javascript:;" class="weui-btn weui-btn_mini weui-btn_default" @click="closeWindow">取消修改</a>
        </div>
    </div>
</template>

<script>
  import MultiSelector from '../../components/MultiSelector'
  import ProjectItem from '../../components/ProjectItem'
  import {
    closeWindow,
    getPageParams,
    toast,
    confirm,
    showAlert,
    listenPage,
    addEventListener,
    sendEvent
  } from '../../utils/ApiCloudUtils'
  import {DEPARTMENTS} from '../../ProjectContants'
  import {approveUserRegister, editUser, getProjects, removeUser, resetUserPassword} from '../../utils/DataUtils'

  export default {
    name: 'userDetail',
    components: { MultiSelector, ProjectItem },
    data () {
      return {
        user: {},
        buttons: [],
        active: true,
        isUserManagement: false,
        changeDepartments: DEPARTMENTS.map(department => {
          department.id = department.dpid
          department.text = department.dpname
          department.status = 'normal'
          return department
        }),
        selectedItem: null,
        searchProjectForm: {
          inchargeUsersIdText: '',
          pageNumber: 1
        },
        projects: []
      }
    },
    created () {
      this.getPageParams()
    },
    watch: {
      selectedItem (newItem) {
        if (newItem) this.user.department = newItem
      }
    },
    computed: {
      hasResetPasswordPower () {
        return this.isUserManagement && this.buttons.includes('reset-password')
      },
      hasActivePower () {
        return this.buttons.includes('active')
      },
      hasChangeDepartmentPower () {
        return this.buttons.includes('change-department')
      },
      hasApplyRegisterPower () {
        return this.buttons.includes('apply-register')
      },
      userCanApply () {
        return this.user.status === 0
      },
      canChangeDepartment () {
        if (this.isUserManagement) {
          return this.hasChangeDepartmentPower
        }

        return this.hasApplyRegisterPower && this.userCanApply
      },
      canSave () {
        if (this.isUserManagement) {
          return this.hasActivePower || this.hasChangeDepartmentPower
        }

        return this.hasApplyRegisterPower && this.userCanApply
      },
      statusName () {
        return this.user.status === 1 ? '启用' : '禁用'
      },
      applyStatusName () {
        switch (this.user.status) {
          case 0:
            return '待审批'
          case -1:
            return '已拒绝'
          default:
            return '已通过'
        }
      }
    },
    methods: {
      async getPageParams () {
        let { user, isUserManagement, buttons = [] } = await getPageParams()
        this.user = user
        console.log("111", this.user)
        this.buttons = buttons
        this.isUserManagement = isUserManagement
        this.active = user.status === 1
        if (buttons.includes('remove-user')) { // 拥有删除权限
          sendEvent('layout-showBtnRight', {
            winName: window.api.winName,
            btnRight: {
              text: '删除'
            }
          })
          addEventListener('layout-btnRight-click', this.removeUser.bind(this))
        }

        if (isUserManagement) {
          this.searchProjectForm.inchargeUsersIdText = user.juid
          this.getProjects()
        }
      },
      async save () {
        if (this.isUserManagement) {
          let { c, m, d } = await editUser(this.user.juid, this.user.department.dpid, this.active)
          if (c === 0) {
            toast(m)
          }
        } else {
          let { c, m, d } = await approveUserRegister(this.user.juid, this.user.department.dpid, this.active)
          if (c === 0) {
            toast(m)
            this.user.status = this.active ? 1 : -1
          }
        }
      },
      closeWindow,
      async resetPassword () {
        if (!await confirm('确认重置该用户的密码')) {
          return
        }
        let { c, m, d } = await resetUserPassword(this.user.juid)
        if (c === 0) showAlert(m)
      },
      async getProjects () {
        let { c, m, d } = await getProjects(this.searchProjectForm)
        if (c !== 0) return

        let { rows, pages } = d
        this.projects = this.searchProjectForm.pageNumber === 1 ? rows : this.projects.concat(rows)

        if (this.searchProjectForm.pageNumber < pages) {
          this.searchProjectForm.page++
          listenPage(() => this.getData.bind(this))
        }
      },
      async removeUser ({ winName }) {
        if (winName !== window.api.winName || !await confirm('删除后数据无法恢复，确认删除', '确认删除')) return
        let { c, m } = await removeUser(this.user.juid)
        if (c === 0) {
          toast(m)
          setTimeout(closeWindow, 2000)
        }
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .user-form {
        .user-form-header_box {
          height: 260px;
          position: relative;
          .header-box_img {
            width: 200px;
            height: 200px;
            background: #ccc;
            position: absolute;
            left: 50%;
            top: 50%;
            margin-left: -100px;
            margin-top: -100px;
            border-radius: 10px;
            img {
              width: 100%;
              height: 100%;
              border-radius: 10px;
            }
          }
        }
        .user-form-item {
            position: relative;
            padding: 0 22px;
            padding-right: 40px;
            font-size: 14px;
            height: 64px;
            line-height: 64px;
            color: #8D92A3;
            // font-weight: 700;
            letter-spacing: 1px;

            // &.user-form-item-reset {
            //     // color: @baseColor;
            // }

            & > span {
                float: right;
                position: relative;

                .weui-switch {
                    position: absolute;
                    right: -20px;
                    margin-top: 16px;
                }
            }

            &.editable:after {
                position: absolute;
                content: ' ';
                right: 22px;
                top: 50%;
                width: 10px;
                height: 10px;
                margin-top: -5px;
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
        }

    }

    .incharge-projects-title {
        position: relative;
        margin-top: 10px;
        padding: 0 22px;
        height: 64px;
        line-height: 64px;
        font-size: 20px;
        color: #22242A;

        
        &:before {
          position: absolute;
          content: '';
          left: 0;
          right: 0;
          height: 1px;
          background: rgb(218, 218, 218);
          -webkit-transform: scaleY(0.5);
          -moz-transform: scaleY(0.5);
          -ms-transform: scaleY(0.5);
          -o-transform: scaleY(0.5);
          transform: scaleY(0.5);
        }

        &:before {
            display: none;
            top: 0;
        }

        &:after {
            bottom: 0;
        }
    }

    .right-arrow {
      // position: relative;
      height: 100%;
      &:after {
        position: absolute;
        content: ' ';
        right: -15px;
        top: 50%;
        width: 10px;
        height: 10px;
        margin-top: -5px;
        border-right: 2px solid #CDCDD7;
        border-bottom: 2px solid #CDCDD7;
        -webkit-transform: rotate(-45deg);
        -moz-transform: rotate(-45deg);
        -ms-transform: rotate(-45deg);
        -o-transform: rotate(-45deg);
        transform: rotate(-45deg);
      }
    }

    .user-form-buttons {
      margin-top: 0;
      padding-bottom: 15px;
      background: #FFFFFF;
      .weui-btn_default, .weui-btn_primary {
        height: 46px;
        line-height: 46px;
        border-radius: 23px;
      }
      .weui-btn_primary {
        width: 56%;
        background: #6478D3;
      }
      .weui-btn_default {
        width: 30%;
        margin-left: 20px;
        margin-top: 0;
        background: #CDCDD7;
        border: none;
      }
    }
</style>
