<template>
    <div id="app">
        <ProjectHeader :project="project"/>
        <ul class="users-container project-member">
            <li v-for="(row,rowIndex) in members">
              <div class="user-header_img">
                <img :src="row.avatarUrl" alt="">
              </div>
              <div class="user-info_box">
                <div class="users-name">
                  {{ row.juname }}
                  <div class="project-icon-remove" @click="remove(row,rowIndex)" v-if="canRemoveMember && row.type === 3">
                      <b></b>
                      <b></b>
                      <b></b>
                  </div>
                </div>
                  <div class="users-info">
                      <div>{{row.mobile}}</div>
                      <div><span class="users-status" v-text="row.typeName"></span></div>
                  </div>
                  
              </div>
            </li>
        </ul>
        <div class="project-bottom-add" 
             @click="add"
             v-if="canAddMember">
            添加人员
        </div>
    </div>
</template>

<script>
  import ProjectHeader from '../../components/ProjectHeader.vue'
  import {getPageParams, openWindow, addEventListener, toast} from '../../utils/ApiCloudUtils'
  import {getProject, removeProjectMember} from '../../utils/DataUtils'

  export default {
    name: 'app',
    components: { ProjectHeader },
    data () {
      return {
        project: {},
        paddingBottom: 0,
        members: [],
        buttons: []
      }
    },
    computed: {
      footerHeight () {
        return this.paddingBottom + 40
      },
      canAddMember () {
        return this.project.canEdit && this.buttons.includes('create-member')
      },
      canRemoveMember () {
        return this.project.canEdit && this.buttons.includes('remove-member')
      }
    },
    async created () {
      addEventListener('layout-windowViewAppear', ({ winName }) => {
        if (winName !== window.api.winName) {
          return
        }
        this.getData()
      })

      let { project } = await getPageParams()
      this.project = project
      this.members = project.members
      console.log('人员数据', JSON.stringify(this.project, null, 4))
      this.getData()

      this.paddingBottom = window.api.safeArea.bottom
    },
    methods: {
      async getData () {
        let { c, d } = await getProject(this.project.jpid)
        if (c !== 0) {
          return
        }
        let { project, buttons } = d
        this.project = project
        this.buttons = buttons
        this.members = project.members
      },
      async remove (member, index) {
        if (!await confirm(`确认删除成员【${member.juname}】?`)) {
          return
        }

        let { c, m } = await removeProjectMember(this.project.jpid, member.pmid)
        if (c !== 0) {
          return
        }

        toast(m)
        this.members.splice(index, 1)
      },
      add () {
        openWindow('project_member_add.html', '添加项目参与人员', { projectId: this.project.jpid })
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    ul.project-member {
        padding-bottom: 40px;
        li {
          // overflow: hidden;
          .project-icon-remove {

          }
          &:after {
            position: absolute;
            content: '';
            left: 22px;
            right: 22px;
            bottom: 0;
            height: 1px;
            background: #d5d5d5;
            -webkit-transform: scaleY(0.5);
            -moz-transform: scaleY(0.5);
            -ms-transform: scaleY(0.5);
            -o-transform: scaleY(0.5);
            transform: scaleY(0.5);
            width: 90%;
          }
        }
        .user-header_img {
          width: 48px;
          height: 48px;
          float: left;
          border-radius: 24px;
          // overflow: hidden;
          // padding-right: 15px;
          img {
            width: 48px;
            height: 48px;
            border-radius: 24px;
          }
        }
        .user-info_box {
          min-width: 70%;
          float: left;
          padding-left: 15px;
          
          .users-name {
            font-size: 14px;
            color: #22242A;
            position: relative;

            .project-icon-remove {
              bottom: -7px;
              right: -56px;
            }
          }

          .users-info {
            font-size: 12px;
            color: #8D92A3;
          }



          .users-status {
            // padding-left: 20px;
          }
        }
        li:before {
            display: none;
        }
    }
    .project-bottom-add {
      background: #6478D3!important;
      width: 335px;
      height: 46px !important;
      line-height: 46px !important;
      margin: 0 auto;
      border-radius: 23px;
      bottom: 2.5% !important;
    }
</style>
