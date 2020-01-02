<template>
    <div id="app">
        <ProjectHeader :project="project" v-if="project"/>
        <div class="project-track-container" v-if="showCreateButton" @click="editRemark()">
            <!-- <img src="../../assets/images/btn-create-record.png" class="create-record" @click="editRemark()"/> -->
            <div>创建记录</div>
        </div>
        <div class="project-track-operation weui-flex"
             v-if="showOperaResultButton">
            <div class="success" 
                 @click="operaResult(true)">跟踪成功
            </div>
            <div class="fail" 
                 @click="operaResult(false)">跟踪失败
            </div>
        </div>
        <ul class="project-track-items">
            <li v-for="remark in remarks">
                <!-- <span v-text="1"></span> -->
                <div class="project-track-items-time">
                  <font v-text="formatDate(remark.updated, 'yyyy-MM-dd hh:mm:ss')" style="font-size: 14px;color: #22242A;"></font>
                  <div class="project-icon-remove" @click="remove(remark)" v-if="showRemoveButton">
                      <b></b>
                      <b></b>
                      <b></b>
                  </div>
                </div>
                <div class="project-track-items-people">
                  添加人：<font v-text="remark.juname"></font> 
                  
                </div>
                
                <div class="desc">
                  备注：
                    {{remark.remark}}
                    <div class="edit" @click="editRemark(remark)" v-if="showEditButton"></div>
                </div>
                
            </li>
        </ul>
        <create-record-form :visible.sync="showRecordForm"
                            :remark="remark?remark.remark:null"
                            @confirmed="confirm"/>
    </div>
</template>

<script>
  import ProjectHeader from '../../components/ProjectHeader'
  import CreateRecordForm from '../../components/CreateRecordForm'
  import {getPageParams, toast, confirm} from '../../utils/ApiCloudUtils';
  import {
    createProjectTrack,
    editProjectTrack,
    getProjectTracks,
    removeProjectTrack,
    trackProjectResult
  } from "../../utils/DataUtils";
  import {formatDate} from "../../utils/CommonUtils";
  import {LAYOUT_FOOTER_HEIGHT} from "../../ProjectContants";

  export default {
    name: 'app',
    components: {ProjectHeader, CreateRecordForm},
    data() {
      return {
        project: null,
        remarks: [],
        buttons: [],
        showRecordForm: false,
        remark: null,
        paddingBottom: 0,
        footerHeight: LAYOUT_FOOTER_HEIGHT
      }
    },
    computed: {
      tracking() {
        return this.project.canEdit && this.project.canEdit && this.project.status === 7;
      },
      showCreateButton() {
        return this.tracking && this.buttons.includes('create-remark')
      },
      showEditButton() {
        return this.tracking && this.buttons.includes('edit-remark')
      },
      showRemoveButton() {
        return this.tracking && this.buttons.includes('remove-remark')
      },
      showOperaResultButton() {
        return this.tracking && this.buttons.includes('post:/api/project/{id}/track/succeed')
      }
    },
    async created() {
      let {project} = await getPageParams();
      this.project = project;
      this.getData();
      this.paddingBottom = window.api.safeArea.bottom;
      addEventListener('layout-windowViewAppear', ({winName}) => {
        if (winName !== window.api.winName) {
          return;
        }
        this.getData();
      });
    },
    methods: {
      formatDate,
      async getData() {
        let {c, m, d} = await getProjectTracks(this.project.jpid);
        if (c !== 0) {
          return;
        }
        let {remarks, project, buttons} = d;
        this.buttons = buttons;
        this.remarks = remarks;
        this.project = project;
      },
      async confirm(message) {
        let {c, m} = await (this.remark ? editProjectTrack(this.project.jpid, this.remark.jptrid, message)
          : createProjectTrack(this.project.jpid, message));
        if (c === 0) {
          this.getData();
          return toast(m);
        }
      },
      editRemark(remark = null) {
        this.remark = remark && remark.jptrid ? remark : null;
        this.showRecordForm = true
      },
      async remove({jptrid}) {
        if (!await confirm('确认删除？')) {
          return;
        }
        let {c, m} = await removeProjectTrack(this.project.jpid, jptrid);
        if (c === 0) {
          this.getData();
          return toast(m);
        }
      },
      async operaResult(succeed) {
        if (!await confirm(`确认跟踪${succeed ? '成功' : '失败'}？`)) {
          return;
        }
        let {c, m} = await trackProjectResult(this.project.jpid, succeed);
        if (c === 0) {
          toast(m);
          this.project.status = succeed ? 8 : 9;
        }
      }
    }
  }
</script>

<style lang="less">
    @import '../../assets/style.less';

    .project-track-container {
        padding: 7px 22px;
        div {
          width: 100px;
          height: 36px;
          background: #6478D3;
          border-radius: 23px;
          color: #fff;
          line-height: 36px;
          text-align: center;
          font-size: 14px;
        }
        .create-record {
            width: 100px;
            &:active {
                opacity: 0.9;
            }
        }
    }

    .project-track-items {
        margin-top: 12px;
        list-style: none;

        .project-track-items-people {
          position: relative;
          font-size: 12px;
          color: #8D92A3;
          
        }
        .project-track-items-time {
          position: relative;
        }

        li {
            position: relative;
            padding: 22px 5.5% 23px 5.5%;

            span {
                position: absolute;
                left: 20px;
                top: 18px;
                height: 20px;
                width: 20px;
                font-size: 12px;
                line-height: 20px;
                text-align: center;
                -webkit-border-radius: 50%;
                -moz-border-radius: 50%;
                border-radius: 50%;
                color: #fff;
                background: #6478D3;
            }

            div {
                margin-bottom: 10px;
                font-size: 13px;
                color: #7f7f7f;
                font {
                    // margin-left: 13px;
                }

                &.desc {
                    padding-left: 14px;
                    min-height: 68px;
                    line-height: 33px;
                    margin-bottom: 0;
                    background-color: #f5f5f5;
                    -webkit-border-radius: 5px;
                    -moz-border-radius: 5px;
                    border-radius: 5px;
                    padding-right: 40px;
                    position: relative;

                    .edit {
                        position: absolute;
                        right: 14px;
                        top: 24px;
                        width: 32px;
                        height: 32px;
                        z-index: 10;
                        background-image: data-uri('image/png;base64', '../../assets/images/Edit.png');
                        background-size: 16px;
                        background-repeat: no-repeat;
                        background-position: center;
                        /*background-color: red;*/
                        -webkit-border-radius: 5px;
                        border-radius: 5px;
                        &:active {
                            opacity: 0.6;
                            /*background-color: #eee;*/
                        }
                    }
                }
            }

            &:first-child:before,
            &:after {
                position: absolute;
                content: ' ';
                left: 22px;
                right: 22px;
                height: 1px;
                background-color: #eee;
                -webkit-transform: scaleY(0.5);
                -moz-transform: scaleY(0.5);
                -ms-transform: scaleY(0.5);
                -o-transform: scaleY(0.5);
                transform: scaleY(0.5);
            }
            &:first-child:before {
                top: 0;
            }
            &:after {
                bottom: 0;
            }
        }
    }

    .project-track-operation {
        @trackOperationHeight: 50px;
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        text-align: center;
        color: #fff;
        line-height: @trackOperationHeight;
        padding: 0 5.3% 5%;
        justify-content: space-between;

        & + .project-track-items {
            padding-bottom: @trackOperationHeight;
        }

        .success {
            width: 46%;
            height: 46px;
            line-height: 46px;
            border-radius: 23px;
            background-color: #6478D3;
            &:active {
                background-color: #6478D3;
            }
        }
        .fail {
            width: 46%;
            height: 46px;
            line-height: 46px;
            border-radius: 23px;
            background-color: #EF4B5F;
            &:active {
                background-color: #EF4B5F;
            }
        }
    }
</style>
