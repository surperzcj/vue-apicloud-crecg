<template>
    <div id="app">
        <div class="">
            <div class="form-item">
                <label>内容</label>
                <input type="text" placeholder="请输入材料内容" v-if="isSelfTack" readonly v-model="form.content"/>
                <input type="text" placeholder="请输入材料内容" v-else v-model="form.content"/>
            </div>
            <div class="form-item">
                <label>提交人</label>
                <input type="text" placeholder="请输入提交人名字" readonly v-model="juname"/>
            </div>
            <div class="form-item">
                <label>提交时间</label>
                <span>{{formatDate(taskDetail.created)}}</span>
            </div>
            <div class="form-item ">
                <label>附件</label>
                <span class="add_file" v-if="!isSelfTack" @click="uploadAttachment(progress)">
                  <img src="../../assets/images/icon-add.png" alt="">
                </span>
            </div>
            <ul class="progress-files" v-if="progress && progress.length > 0">
                <li v-for="(file,fileIndex) in progress" :key="fileIndex">
                    <div v-text="file.originName"></div>
                    <p class="sc" v-if="!isSelfTack && taskDetail.status === 20" @click="delFile(file)">删除</p>
                    <p class="yl" v-if="isSelfTack || taskDetail.status !== 20" @click="viewAttachment(file)">预览</p>
                    <p class="xz" v-if="isSelfTack || taskDetail.status !== 20" @click="downloadFile(file)">下载</p>
                    <!-- <span class="remove"
                          @click="removeFile(progress,fileIndex)"></span> -->
                </li>
            </ul>

            <div class="form-item" v-if="isSelfTack && taskDetail.status == 10">
                <label>意见<span style='color:red;'>*</span></label>
            </div>
            <div class="form-item" v-if="isSelfTack && taskDetail.status == 10">
              <textarea type="text" rows="5" placeholder="请输入意见内容" v-if="isSelfTack" v-model="taskContent"/>
            </div>
            <div class="form-item">
                <label>审核历史</label>
            </div>
            <div class="sh_item" v-for="(item,index) in taskDetail.auditList" :key="index">
              <div class="stauts sh" v-if="item.status === 10">待审核</div>
              <div class="stauts jj" v-if="item.status === 20">已拒绝</div>
              <div class="stauts tg" v-if="item.status === 30">已通过</div>

              <div class="content">
                <div class="text">{{item.content || '--'}}</div>
                <div class="bottom">
                  <div class="name">{{item.juname}}</div>
                  <div class="time">{{formatDate(item.created)}}</div>
                </div>
              </div>
            </div>
            <div style="height:70px;"></div>
        </div>
        
        <div class="progress-rollback1" v-if="isSelfTack && taskDetail.status == 10">
          <div class="left" @click="possTask(30)">通过</div>
          <div class="right" @click="possTask(20)">拒绝</div>
        </div>
        <!-- <div class="progress-rollback1" v-if="isSelfTack && taskDetail.status != 10">
          <div class="left bg_999">通过</div>
          <div class="right bg_999">拒绝</div>
        </div> -->
        <div class="progress-rollback1" v-if="!isSelfTack && taskDetail.status === 20">
          <div class="left" @click="postTask">重新提交</div>
          <div class="right" @click="delTask">删除</div>
        </div>

        <div class="upload_bg" v-show="showUpload">
          <div class="box">
            <div class="loading">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
            正在上传
          </div>
        </div>

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
    closeWindow,
    openDocReader,
    openFileBrowser,
    openPhotoViewer,
    selectPicture,
    toast,
    confirm,
    uploadFile,
    downloadFile,
    addEventListener,
    openWindow
  } from '../../utils/ApiCloudUtils'
  import {
    createProgressRemark, editProgressRemark, getProjectContracts,
    getProjectProgresses,
    projectNextProgress, projectRollbackProgress, removeProgressRemark,
    removeProjectProgressFile,
    putTaskDetail,
    getTaskDetail,
    delTaskDetail,
    delAttachment,
    attachment,
    TaskAudit,
    upFile,
    uploadProjectProgressFile
  } from '../../utils/DataUtils'
  import {formatDate} from '../../utils/CommonUtils'
  import {PROJECT_PROGRESS_LIB} from '../../ProjectContants'

  export default {
    name: 'app',
    components: { ProjectHeader, MultiSelector, CreateRecordForm },
    data () {
      return {
        showUpload:false,
        delFileList:[],
        uploadFileList:[],
        isSelfTack:false,  // 自己创建的任务
        form:{
          ptdid:'',
          content:'',
        },
        taskContent:'',
        taskDetail:{},
        juname:'',
        project: {},
        progresses: [],
        selectList: [],
        buttons: [],
        progress: [],
        showRecordForm: false,
        planedTime: false,
        remarkProgress: null,
        type: null,
        paddingBottom: 0,
        remark: null
      }
    },
    async created () {
      let { project, isSelfTack } = await getPageParams()
      this.project = project
      this.createdJuname = project.createdJuname
      console.log(this.project,'project')
      this.isSelfTack = isSelfTack
      this.getData()


      // this.paddingBottom = window.api.safeArea.bottom
      // addEventListener('layout-windowViewAppear', ({ winName }) => {
      //   if (winName !== window.api.winName) {
      //     return
      //   }
      //   this.getData()
      // })
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
      closeWindow,
      async delTask(){
        let { c, m } = await delTaskDetail(this.form.ptdid)
        if (c === 0) {
          toast(m)
          setTimeout(() => {
            closeWindow()
          }, 300)
        }
      },
      async postTask(){
        let { c, m } = await putTaskDetail(this.form)
        for(let i=0;i<this.delFileList.length;i++){
          let item = this.delFileList[i]
          let del = await delAttachment(item)
          console.log('删除好了')
          if(del.c !== 0){
            toast(del.m)
          }
        }
        for(let j=0;j<this.uploadFileList.length;j++){
          let item = this.uploadFileList[j]
          item.ptdid = this.taskDetail.ptdid
          let del = await attachment(item)
          console.log('新加好了')
          if(del.c !== 0){
            toast(del.m)
          }
        }

        if (c === 0) {
          toast(m)
          setTimeout(() => {
            closeWindow()
          }, 300)
        }
      },
      async possTask(status){
        if(this.taskContent ===''){
          toast("请输入审核意见")
          return
        }
        let params = {
          ptdid:this.form.ptdid,
          status:status,
          content:this.taskContent
        }
        let { c, m } = await TaskAudit(params)
        if (c === 0) {
          toast(m)
          setTimeout(() => {
            closeWindow()
          }, 300)
        }
      },
      formatDate (ts) {
        return formatDate(ts, 'yyyy-MM-dd hh:mm:ss')
      },
      plantime () {
        openWindow('project_progress_plantime.html', '进度时间安排', {
          project: this.project,
          progresses: this.progresses
        })
      },
      async getData () {
        let parmas = {
          ptdid:this.project.ptdid
        }
        let { c, d } = await getTaskDetail(parmas)
        if (c !== 0) {
          return
        }
        this.taskDetail = d
        this.form.ptdid = d.ptdid
        this.form.content = d.content
        d.attachmentList.map(item=>{
          let box = {
            originName:item.originName,
            url:item.fullUrl,
            ptaid:item.ptaid,
          }
          this.progress.push(box)
        })
        console.log(this.progress,'this.progresses')
        this.juname = d.juname
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
        var filename = r.name
        var index1=filename.lastIndexOf(".")+1;
        var index2=filename.length;
        var type=filename.substring(index1,index2);
        console.log(type,'type')
        let suffix = {
          jpg:true,
          gif:true,
          png:true,
          jpeg:true,
          pdf:true,
          docx:true,
          doc:true,
          xlsx:true,
          xls:true,
          ppt:true
        }
        if(!suffix[type]){
          toast('不支持该文件类型')
          return
        }
        
        console.log(r)

        this.uploadFile(progress, r.url, r.name)
      },
      async uploadFile (progress, url, name) {
        this.showUpload = true
        let r = await uploadFile(url)
        if (r.c !== 0) {
          toast(r.m)
          return
        }
        this.showUpload = false
        console.log(r)
        
        // let { c, d } = await uploadFile(this.project.jpid, progress.id, r.d.key, name)
        // if (c !== 0) {
        //   return
        // }

        this.progress.push(r.d)
        this.uploadFileList.push(r.d)
      },
      async delFile (file) {
        this.delFileList.push(file.ptaid)
        this.progress.map((item,index)=>{
          if(item.ptaid === file.ptaid){
            this.progress.splice(index,1)
          }
        })
        // console.log(file)
        // return
        // let r = await delAttachment(file.url, saveUrl)
        // if(r){
        //   toast('下载成功')
        // }
      },
      async downloadFile (file) {
        console.log(file)
        toast('正在下载...')
        let saveUrl = 'fs://' +file.originName
        let r = await downloadFile(file.url, saveUrl)
        if(r.state === 1){
          toast('文件已保存至'+r.savePath)
        }
      },
      async removeFile (files, index) {
        let file = files[index]
        // let { c } = await removeProjectProgressFile(file.jpid, file.progid, file.id)
        // if (c === 0) {
          files.splice(index, 1)
        // }
      },
      viewAttachment (file) {
        console.log(file,'file')
        if (/\.(gif|jpg|jpeg|bmp|png)$/.test(file.originName)) {
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
        if (!await confirm('是否撤销操作，会退到上一进度？')) {
          return
        }

        let id
        if (this.progresses.every(({ status }) => status === 3)) {
          id = this.progresses[this.progresses.length - 1].id
        } else if (this.progresses.every(({ status }) => status === 1)) {
          return
        } else {
          id = this.progresses.filter(({ status }) => status === 2)[0].id
        }

        let { c, m } = await projectRollbackProgress(this.project.jpid, id)
        if (c === 0) {
          toast(m)
          this.getData()
        }
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .sh_item{
        display: flex;
        padding: 0 20px;
        margin-bottom: 20px;
      .stauts{
        border: 1px solid #999;
        border-radius: 50%;
        width: 50px;
        line-height: 50px;
        height: 50px;
        font-size: 12px;
        text-align: center;
        margin-right: 10px;
      }
      .sh{
        border:1px solid #00A6CE;
        color:#00A6CE;
      }
      .jj{
        border:1px solid #CA0000;
        color:#CA0000;
      }
      .tg{
        border:1px solid #6877CD;
        color:#6877CD;
      }
      .content{
        flex: 1;
        .text{}
        .bottom{
            display: flex;
            justify-content: space-between;
          .name{
            color:#666;
          }
          .time{
            color:#999;
          }
        }
      }
    }



    .project-add-form{
          background-color: #fff!important;
    }
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
        margin-top: 7px;
        list-style: none;

        & > li {
            position: relative;
            padding: 20px 20px 20px 68px;
            letter-spacing: 1px;
            min-height: 88px;

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

            &:before {
                position: absolute;
                content: '';
                width: 48px;
                height: 48px;
                left: 0;
                top: 20px;
                background-repeat: no-repeat;
                background-position: center;
                background-size: 20px;
                background-color: #47d783;
                border-radius: 50%;
            }

            &.project-progress-2:before {
                background-color: #7800F5;
            }

            &.no-1:before {
                background-image: data-uri("image/png;base64", "../../assets/images/icon-progress-1.png");
            }

            &.no-2:before {
                background-image: data-uri("image/png;base64", "../../assets/images/icon-progress-2.png");
            }

            &.no-3:before {
                background-image: data-uri("image/png;base64", "../../assets/images/icon-progress-3.png");
            }

            &.no-4:before {
                background-image: data-uri("image/png;base64", "../../assets/images/icon-progress-4.png");
            }

            &.no-5:before {
                background-image: data-uri("image/png;base64", "../../assets/images/icon-progress-5.png");
            }

            .progress-title {
                font-size: 12px;
                line-height: 22px;
                color: #8D92A3;

                span:first-child {
                    padding-right: 20px;
                }
            }

            .progress-subtitle {
                position: relative;
                color: #22242A;
                font-size: 15px;
                line-height: 22px;
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
                margin-top: 11px;

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

    .progress-files {
                margin-top: 5px;
                list-style: none;
                margin-left: 20px;
                padding-bottom: 20px;

                li {
                    position: relative;
                    padding-right: 35%;

                    &:not(:first-child) {
                        margin-top: 14px;
                    }

                    & > div {
                        position: relative;
                        padding: 5px 10px 5px 34px;
                        line-height: 17px;
                        font-size: 12px;
                        color: #6877CD;
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
                            background: data-uri('image/png;base64', '../../assets/images/huan.png') no-repeat center;
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
                    .sc{
                          position: absolute;
                          top: 3px;
                          right: 20px;
                          font-size: 12px;
                          color: #CA0000;
                    }
                    .yl{
                          position: absolute;
                          top: 3px;
                          right: 20px;
                          font-size: 12px;
                          color: #00A6CE;
                    }
                    .xz{
                      position: absolute;
                          top: 3px;
                          right: 80px;
                          font-size: 12px;
                          color: #6877CD;
                    }
                }
            }


            .fomr-item:before{
              display: none;
            }
            .add_file{
                position: absolute;
                right: 20px;
                width: 20px;
              img{
                width:100%;
              }
            }
            .progress-rollback1 {
                position: fixed;
                left: 0;
                right: 0;
                line-height: 44px;
                z-index: 100;
                bottom: 0;
                display: flex;
                justify-content: space-between;
                .left{
                  line-height: 44px;
                  text-align: center;
                  color: #fff;
                  background-color:#6478D3;
                  border-radius: 22px;
                  flex: 1;
                  margin: 10px;
                }
                .right{
                  line-height: 44px;
                  text-align: center;
                  color: #fff;
                  background-color:#f43530;
                  border-radius: 22px;
                  flex: 1;
                  margin: 10px;
                }
            }
            .bg_999{
              background-color:#999!important;
            }

.form-item{
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    line-height: 41px;
  label{
    font-size: 16px;
    color: #4F4F4F;
  }
  input{
    font-size: 16px;
    border: none;
    text-align: right;
  }
  textarea{
    background: #F3F3F4;
    border: none;
    width: 100%;
    border-radius: 5px;
    padding: 8px;
    font-size: 16px;
  }
}
.upload_bg{
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 100;
    .loading{
        margin: 0 auto;
        width: 60px;
        height: 65px;
        margin-top: 30px;
        }
        .loading span{
            display: inline-block;
            width: 8px;
            height: 100%;
            border-radius: 4px;
            background: lightgreen;
            -webkit-animation: load 1s ease infinite;
        }
        @-webkit-keyframes load{
            0%,100%{
                height: 40px;
                background: lightgreen;
            }
            50%{
                height: 70px;
                margin: -15px 0;
                background: lightblue;
            }
        }
        .loading span:nth-child(2){
            -webkit-animation-delay:0.2s;
        }
        .loading span:nth-child(3){
            -webkit-animation-delay:0.4s;
        }
        .loading span:nth-child(4){
            -webkit-animation-delay:0.6s;
        }
        .loading span:nth-child(5){
            -webkit-animation-delay:0.8s;
        }
  .box{
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%);
    background: #fff;
    width: 140px;
    border-radius: 5px;
    height: 120px;
    text-align: center;
    font-size: 12px;
  }
}
</style>
