<template>
    <div id="app">
        <ProjectHeader :project="project"/>
        <div class="project-add-form project-mark-form">
            <div class="form-item">
                <label>项目负责人</label>
                <input type="text" placeholder="请选择项目负责人" readonly @click="$refs.userIncharge.show()"
                       v-model="selectedUserIncharge && selectedUserIncharge.juname"/>
            </div>
            <div class="form-item">
                <label>所属部门</label>
                <input type="text" placeholder="请所属部门" readonly @click="$refs.departments.show()"
                       v-model="selectedDepartment && selectedDepartment.jcname"/>
            </div>
        </div>
        <div class="user-form-buttons">
            <a href="javascript:;" class="weui-btn weui-btn_mini weui-btn_primary sure-add" @click="save">确认</a>
            <a href="javascript:;" class="weui-btn weui-btn_mini weui-btn_default cancle-add" @click="closeWindow">取消</a>
        </div>

        <MultiSelector title="选择人员" v-model="selectedUserIncharge" :list="settings.userIncharges" ref="userIncharge"/>
        <MultiSelector title="选择所属部门" v-model="selectedDepartment" :list="settings.departments" ref="departments"/>
    </div>
</template>

<script>
  import _ from 'lodash'
  import {closeWindow, getPageParams, toast} from '../../utils/ApiCloudUtils'
  import ProjectHeader from '../../components/ProjectHeader'
  import MultiSelector from '../../components/MultiSelector'
  import {getProjectSettings, markProjectIncharge} from '../../utils/DataUtils'
  import {parseCreateProjectSettings} from '../../utils/CommonUtils'

  export default {
    name: 'project-mark-incharge',
    components: { ProjectHeader, MultiSelector },
    data () {
      return {
        project: {},
        settings: {
          inchargeUsers: [],
          get userIncharges () {
            return this.inchargeUsers
          },
          departments: []
        },
        selectedUserIncharge: null,
        selectedDepartment: null
      }
    },
    methods: {
      closeWindow,
      async save () {
        if (this.selectedDepartment === null) {
          return toast('请选择所属部门')
        } else if (this.selectedUserIncharge === null) {
          return toast('请选择项目负责人')
        }

        const { c, m, d } = await markProjectIncharge(this.project.jpid, this.selectedUserIncharge.juid, this.selectedDepartment.value)
        if (c === 0) {
          toast(m)
        }
      }
    },
    async mounted () {
      const { project } = await getPageParams()
      this.project = project

      const { c, d } = await getProjectSettings()
      if (c !== 0) return

      this.settings = Object.assign(this.settings, d)
      parseCreateProjectSettings(this.settings)

      this.selectedUserIncharge = this.project.userInchargeObject || null
      if (this.project.dpid) {
        const value = this.project.dpid.toString()
        this.selectedDepartment = _.find(this.settings.departments, { value })
      }
    }
  }
</script>


<style lang="less">
    @import "../../assets/style";

    .project-mark-form {
        padding-bottom: 0 !important;
    }

    .project-mark-form .form-item:first-child:after {
        position: absolute;
        content: '';
        top: 0;
        left: 22px;
        right: 22px;
        height: 1px;
        -webkit-transform: scaleY(0.5);
        -moz-transform: scaleY(0.5);
        -ms-transform: scaleY(0.5);
        -o-transform: scaleY(0.5);
        transform: scaleY(0.5);
    }

    .project-mark-form {
        margin-top: 44px;
        padding-bottom: 0;
    }

    .user-form-buttons {
      bottom: 20px;
      position: fixed;
      width: 100%;
      .sure-add, .cancle-add {
        height: 46px;
        line-height: 46px;
        border-radius: 46px;
      }
    }
</style>
