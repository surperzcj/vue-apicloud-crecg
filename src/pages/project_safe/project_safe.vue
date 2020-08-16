<template>
    <div id="app">
        <div class="progress-rollback" @click="rollback" :style="`height: 44px;`">
            新建任务
        </div>
        <ul class="project-progress" :style="`padding-bottom: ${footerHeight}px`">
            <li :class="`project-progress-${progress.status} no-${index+1}`" v-if="progresses.length>0" v-for="(progress, index) in progresses" :key="index" @click="goTaskDetail(progress)">
                <div class="progress-subtitle">
                      {{progress.taskName}}
                  </div>
                <div class="progress-title">
                    <span v-text="'指定时间：'+formatDate(progress.created)"></span>
                    <span>创建人：{{progress.createdJuname}}</span>
                </div>
                
                <div class="progress-opera-record">
                    <div>参与人：<span v-text="progress.juname"></span></div>
                </div>
            </li>

            <li v-if="progresses.length===0" style="text-align: center;line-height: 88px;">
                暂无数据~
            </li>

        </ul>
        <create-record-form :visible.sync="showRecordForm"
                            :remark="remark?remark.remark:null"
                            @confirmed="confirmRemark"/>
    </div>
</template>

<script>
  import MultiSelector from '../../components/MultiSelector'
  import CreateRecordForm from '../../components/CreateRecordForm'
  import ProjectHeader from '../../components/ProjectHeader.vue'
  import {
    getPageParams,
    openDocReader,
    openFileBrowser,
    openPhotoViewer,
    selectPicture,
    toast,
    confirm,
    uploadFile,
    addEventListener,
    openWindow
  } from '../../utils/ApiCloudUtils'
  import {
    createProgressRemark, editProgressRemark, getProjectContracts,
    getProjectProgresses,
    projectNextProgress, projectRollbackProgress, removeProgressRemark,
    removeProjectProgressFile,
    uploadProjectProgressFile,
    safeList
  } from '../../utils/DataUtils'
  import {formatDate} from '../../utils/CommonUtils'
  import {PROJECT_PROGRESS_LIB} from '../../ProjectContants'

  export default {
    name: 'app',
    components: { ProjectHeader, MultiSelector, CreateRecordForm },
    data () {
      return {
        project: {},
        progresses: [],
        selectList: [],
        buttons: [],
        progress: null,
        showRecordForm: false,
        planedTime: false,
        remarkProgress: null,
        type: null,
        paddingBottom: 0,
        remark: null
      }
    },
    async created () {
      let { project, type } = await getPageParams()
      this.project = project
      this.type = type
      console.log(this.project,'project')
      console.log(this.type,'type')
      this.getData()


      this.paddingBottom = window.api.safeArea.bottom
      addEventListener('layout-windowViewAppear', ({ winName }) => {
        if (winName !== window.api.winName) {
          return
        }
        this.getData()
      })
    },
    computed: {
      
      isContract () {
        return this.type === 'contract'
      },
      showPlanTime () {
        return !this.isContract && this.project.canEdit && this.buttons.includes('set-plan-times')
      },
      showAddRemark () {
        return !this.isContract && this.project.canEdit && this.buttons.includes('create-remark') && this.planedTime
      },
      showEditRemark () {
        return !this.isContract && this.project.canEdit && this.buttons.includes('edit-remark') && this.planedTime
      },
      showRemoveRemark () {
        return !this.isContract && this.project.canEdit && this.buttons.includes('remove-remark') && this.planedTime
      },
      showRollback () {
        if (this.progresses.length === 0) {
          return false
        }
        if (!(this.project.canEdit && this.progresses[0].status === 3)) {
          return false
        }
        if (this.isContract) {
          return this.buttons.includes('rollback-contract')
        } else {
          return this.planedTime && this.buttons.includes('rollback-progress')
        }
      },
      canOperaProgress () {
        if (this.isContract) {
          return this.buttons.includes('next-contract')
        } else {
          return this.planedTime && this.buttons.includes('next-progress')
        }
      },
      footerHeight () {
        if (!this.showRollback) {
          return 0
        }
        return this.paddingBottom + 44
      }
    },
    methods: {
      goTaskDetail(item){
        console.log(item,'任务详情')
        let params = { project: item }
        openWindow('project_safeDetail.html', '任务详情', params)
      },
      formatDate (ts) {
        return formatDate(ts, 'yyyy-MM-dd')
      },
      plantime () {
        openWindow('project_progress_plantime.html', '进度时间安排', {
          project: this.project,
          progresses: this.progresses
        })
      },
      async getData () {
        let { c, d } = await safeList({
          jpid:this.project.jpid
        })
        if (c !== 0) {
          return
        }
        console.log(d,'d')
        this.progresses = d

        // let { project, progresses, buttons, planedTime } = d
        // this.project = project
        // this.buttons = buttons
        // this.planedTime = planedTime
        // this.progresses = progresses.map(p => {
        //   p.libs = PROJECT_PROGRESS_LIB[p.lib]
        //   if (p.libs.options) {
        //     // p.libValue = p.value ? p.libs.options[parseInt(p.value)] : '更改状态';
        //     p.libValue = '更改状态'
        //   }
        //   return p
        // })
      },
      modifyProgressBySelector (item) {
        console.log('callback', JSON.stringify(item, null, 4))
        if (!item) {
          return
        }

        this.nextStep(this.progress, item.index, true)
      },
      async modifyProgress (progress) {
        if (!progress.libs.options) {
          return this.nextStep(progress, undefined, false)
        }

        this.selectList = progress.libs.options.map((name, index) => {
          return {
            index,
            id: index,
            text: name,
            status: 'normal'
          }
        })
        this.progress = progress
        this.$refs.selectList.show()
      },
      async nextStep (progress, value, skipConfirm = false) {
        if (!skipConfirm && !await confirm('确认完成当前进度？')) {
          return false
        }
        let { c, m, d } = await projectNextProgress(this.project.jpid, progress.id, value)
        if (c === 0) {
          this.getData()
        }
      },
      async uploadImage (progress) {
        let r = await selectPicture()
        if (r === null) {
          return
        }

        this.uploadFile(progress, r.url, r.name)
      },
      async uploadAttachment (progress) {
        let r = await openFileBrowser()
        if (r === null) {
          return
        }

        this.uploadFile(progress, r.url, r.name)
      },
      async uploadFile (progress, url, name) {
        console.log(url, name, progress)
        let r = await uploadFile(url)
        if (r.c !== 0) {
          return
        }

        let { c, d } = await uploadProjectProgressFile(this.project.jpid, progress.id, r.d.key, name)
        if (c !== 0) {
          return
        }

        progress.files.push(d)
      },
      async removeFile (files, index) {
        let file = files[index]
        let { c } = await removeProjectProgressFile(file.jpid, file.progid, file.id)
        if (c === 0) {
          files.splice(index, 1)
        }
      },
      viewAttachment (file) {
        if (/\.(gif|jpg|jpeg|bmp|png)$/.test(file.fname)) {
          openPhotoViewer(file.url)
        } else {
          openDocReader(file.url)
        }
      },
      showRecordFormAction (remarkProgress, remark = null) {
        this.remarkProgress = remarkProgress
        this.remark = remark && remark.jptrid ? remark : null
        this.showRecordForm = true
      },
      async confirmRemark (message) {
        const jpid = this.project.jpid
        const jprogid = this.remarkProgress.id
        let { c, m } = await (this.remark ? editProgressRemark(jpid, jprogid, this.remark.jptrid, message) : createProgressRemark(jpid, jprogid, message))
        if (c === 0) {
          toast(m)
          this.getData()
        }
      },
      async removeRemark ({ jpid, jprogid, jptrid }) {
        if (!await confirm('确认删除?')) {
          return
        }
        let { c, m } = await removeProgressRemark(jpid, jprogid, jptrid)
        if (c === 0) {
          toast(m)
          this.getData()
        }
      },
      async rollback () {
        let params = { project: this.project,edit:false }
        openWindow('project_addSafe.html','新建任务', params)
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .project-plan-time {
        padding: 0 26px;
        display: flex;
        justify-content: space-between;
        height: 72px;
        box-sizing: border-box;
        line-height: 72px;

        .plan-status {
          font-size: 20px;
          color: #22242A;
        }

        .plan-time {
          font-size: 14px;
          color: #6478D3;
          position: relative;
          padding-right: 20px;
          // line-height: 73px;
          &::after {
            position: absolute;
            content: ' ';
            right: 5px;
            top: 50%;
            width: 8px;
            height: 8px;
            margin-top: -4px;
            border-right: 2px solid #CDCDD7;
            border-bottom: 2px solid #CDCDD7;
            -webkit-transform: rotate(-45deg);
            -moz-transform: rotate(-45deg);
            -ms-transform: rotate(-45deg);
            -o-transform: rotate(-45deg);
            transform: rotate(-45deg);
          }
        }

        img {
            width: 100px;
        }
    }

    .progress-rollback {
        position: fixed;
        bottom: 3%;
        left: 0;
        right: 0;
        line-height: 44px;
        text-align: center;
        color: #fff;
        background-color:#6478D3;
        z-index: 100;
        border-radius: 22px;
        width: 80%;
        margin: 2.5% auto 0;

        &:active {
            background-color: @baseColorActive;
        }
    }

    .project-progress {
        margin-left: 16px;
        margin-right: 16px;
        margin-top: 7px;
        list-style: none;

        & > li {
            position: relative;
            padding: 20px 20px 20px 20px;
            letter-spacing: 1px;
            min-height: 88px;
            background: #efefef;
            margin-bottom:16px;

            &:after {
                position: absolute;
                content: '';
                left: 68px;
                right: 20px;
                bottom: 0;
                height: 1px;
                background: #eee;
                transform: scaleY(0.5);
            }

            // &:before {
            //     position: absolute;
            //     content: '';
            //     width: 48px;
            //     height: 48px;
            //     left: 0;
            //     top: 20px;
            //     background-repeat: no-repeat;
            //     background-position: center;
            //     background-size: 20px;
            //     background-color: #47d783;
            //     border-radius: 50%;
            // }

            // &.project-progress-2:before {
            //     background-color: #7800F5;
            // }

            // &.no-1:before {
            //     background-image: data-uri("image/png;base64", "../../assets/images/icon-progress-1.png");
            // }

            // &.no-2:before {
            //     background-image: data-uri("image/png;base64", "../../assets/images/icon-progress-2.png");
            // }

            // &.no-3:before {
            //     background-image: data-uri("image/png;base64", "../../assets/images/icon-progress-3.png");
            // }

            // &.no-4:before {
            //     background-image: data-uri("image/png;base64", "../../assets/images/icon-progress-4.png");
            // }

            // &.no-5:before {
            //     background-image: data-uri("image/png;base64", "../../assets/images/icon-progress-5.png");
            // }

            .progress-title {
                font-size: 12px;
                line-height: 22px;
                color: #151526;
                margin:10px 0;
                display:flex;
                justify-content: space-between;

                span:first-child {
                    padding-right: 20px;
                }
            }

            .progress-subtitle {
                position: relative;
                color: #22242A;
                font-size: 15px;
                line-height: 15px;
                font-weight: 900;

                img {
                    display: none;
                    position: absolute;
                    right: 22px;
                    top: -6px;
                    width: 70px;
                }
            }

            .progress-opera-record {
                display: flex;
                display: -webkit-flex;

                & > div {
                    flex: 1;
                    font-size: 12px;
                    line-height: 12px;
                    color: #151526;
                }
            }

            .progress-opera-action {
                margin-top: 14px;
                // padding-bottom: 18px;
                position: relative;

                .progress-opera-button {
                    height: 34px;
                    line-height: 34px;
                    font-size: 14px;
                    padding: 0 23px;
                    -webkit-border-radius: 3px;
                    -moz-border-radius: 3px;
                    border-radius: 17px;
                    background: #6478D3 !important;
                }

                .btn-change {
                  position: absolute;
                  width: 80px;
                  right: 0;
                  padding: 0;
                  top: -53px;
                }

                .btn-success {
                  position: absolute;
                  width: 80px;
                  right: 0;
                  padding: 0;
                  top: -53px;
                }
            }

            .progress-remarks {
                margin-top: 10px;
                padding-right: 20px;
                list-style: none;

                li {
                    padding: 0 12px;
                    color: #7f7f7f;
                    font-size: 13px;
                    line-height: 33px;
                    -webkit-border-radius: 5px;
                    -moz-border-radius: 5px;
                    border-radius: 5px;
                    background-color: #f5f5f5;
                    word-break: break-all;

                    &:not(:last-child) {
                        margin-bottom: 5px;
                    }

                    .edit,
                    .remove {
                        display: none;
                        float: right;
                        width: 30px;
                        height: 33px;
                        background-size: 18px;
                        background-position: center;
                        background-repeat: no-repeat;

                        &:active {
                            opacity: 0.8;
                        }
                    }

                    .edit {
                        background-image: data-uri('image/png;base64', '../../assets/images/icon-progress-remark-edit.png');
                    }

                    .remove {
                        background-image: data-uri('image/png;base64', '../../assets/images/icon-progress-remark-remove.png');
                    }
                }
            }

            .progress-files {
                margin-top: 5px;
                list-style: none;

                li {
                    position: relative;
                    width: 65%;

                    &:not(:first-child) {
                        margin-top: 14px;
                    }

                    & > div {
                        position: relative;
                        padding: 5px 10px 5px 34px;
                        line-height: 17px;
                        font-size: 12px;
                        color: #7f7f7f;
                        background-color: #f2f2f2;
                        -webkit-border-radius: 5px;
                        -moz-border-radius: 5px;
                        border-radius: 5px;
                        word-break: break-all;
                        word-wrap: break-word;

                        &:before {
                            position: absolute;
                            content: '';
                            left: 0;
                            top: 0;
                            width: 34px;
                            height: 100%;
                            background: data-uri('image/png;base64', '../../assets/images/icon-attachment.png') no-repeat center;
                            background-size: auto 15px;
                        }
                    }

                    span {
                        @size: 30px;
                        position: absolute;
                        right: -@size/2;
                        top: -@size/2;
                        width: @size;
                        height: @size;
                        background: data-uri('image/png;base64', '../../assets/images/icon-remove.png') no-repeat center;
                        background-size: auto 20px;

                        &:active {
                            opacity: 0.7;
                        }
                    }
                }
            }

            .progress-upload {
                position: relative;
                margin-top: 14px;
                width: 65%;
                font-size: 12px;
                line-height: 26px;
                text-align: center;
                border: 1px dashed #7f7f7f;
                -webkit-border-radius: 5px;
                -moz-border-radius: 5px;
                border-radius: 5px;

                span {
                    position: relative;
                    padding-left: 20px;
                    height: 100%;
                    display: inline-block;

                    &:before {
                        position: absolute;
                        content: '';
                        left: 4px;
                        top: 8px;
                        width: 2px;
                        height: 10px;
                        background: #88889c;
                    }

                    &:after {
                        position: absolute;
                        content: '';
                        left: 0;
                        top: 12px;
                        width: 10px;
                        height: 2px;
                        background: #88889c;
                    }
                }

                &:active {
                    background: #88889c;
                    color: #fff;

                    span {
                        &:before,
                        &:after {
                            background: #fff;
                        }
                    }
                }

                input[type=file] {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                }
            }
        }
    }
</style>
