<template>
    <div id="app" class="project-add-container">
        <div id="showMask" v-if="!canSubmit"></div>
        <!-- <ProjectHeader v-if="isEditProject && !clone" :project="this.form"/> -->
        <AreaSelector v-on:areaSelectorSelected="selectAreaSucceed" v-on:areaSelectorQuit="showAreaSelector=false"
                      :show-selector="showAreaSelector" :class="showAreaSelector?'bounceInUp':''"/>
        <MultiSelector title="选择我方单位" v-model="selectedSelfUnit" :list="settings.selfUnits" ref="selfUnit"/>
        <MultiSelector title="选择行业" v-model="selectedIndustry" :list="settings.industries" ref="industry"/>
        <MultiSelector title="选择来源方式" v-model="selectedSourceType" :list="settings.sourceTypes" ref="sourceType"/>
        <MultiSelector title="选择项目性质" v-model="selectedNature" :list="settings.natures" ref="nature"/>
        <MultiSelector title="选择路局" v-model="selectedJbid" :list="settings.jbid" ref="jbid"/>
        <MultiSelector title="选择经营性质" v-model="selectedBusinessNature" :list="settings.businessNatures"
                       ref="businessNature"/>
        <MultiSelector title="选择专业" v-model="selectedSpecialty" multiable :list="settings.specialties" ref="specialty"/>
        <MultiSelector title="选择所属部门" v-model="selectedDepartment" :list="settings.departments" ref="department"/>
        <UserSelector title="选择人员" v-model="selectedUserIncharge" :list="settings.userIncharges" :selectedItemsIdp="selectedItemsIdp" ref="userIncharge"/>
        <UserSelector title="选择人员" multiable v-model="selectedUserDevelop" :list="settings.userDevelops" ref="userDevelop"/>
        <MultiSelector title="选择关注度" v-model="selectedCare" :list="settings.cares" ref="care"/>
        <div class="weui-mask" style="background-color: transparent"
             @click="linkLeaveOwnerUnit" v-if="linkInOwnerUnitContainer && ownerUnitHistoryWords.length > 0">
        </div>
        <ul class="owner-unit-history" v-if="linkInOwnerUnitContainer && ownerUnitHistoryWords.length > 0">
            <li v-for="(word,index) in ownerUnitHistoryWords" v-text="word" :key="index"
                @click="form.ownerUnit = word; linkLeaveOwnerUnit()"></li>
        </ul>

        <div class="project-add-form">
            <div class="form-item">
                <label><span style='color:red;'>*</span>任务名称</label>
                <input type="text" placeholder="请输入任务名称" v-model="form.pname"/>
            </div>
        </div>
        <div class="project-add-form" style="background: #fff;">
            <div class="form-item date">
                <label><span style='color:red;'>*</span>指定时间</label>
                <input type="text" placeholder="请选择时间" disabled v-model="form.dateLimitText"/>
                <input type="date" class="project-add-form-date" v-model="form.actDateLimitText">
            </div>
        </div>
        <div class="project-add-form">
            <div class="form-item selectable no-border">
                <label><span style='color:red;'>*</span>参与人</label>
                <input type="text" placeholder="请选择人员" readonly @click="$refs.userDevelop.show()"
                       v-model="form.userDevelopName"/>
            </div>
        </div>
        
        <div class="project-add-form-buttons-box">
            <div class="sure" id="sure-commit"  @click="save">确认{{isEdit?'修改':'新增'}}</div>
            <div class="cancel" id="cancle-commit" 
                 @click="closeWindow">取消</div>
        </div>
    </div>
</template>

<script>
  import MultiSelector from '../../components/MultiSelector'
  import UserSelector from '../../components/UserSelector'
  import {createProject, editProject, getProjectSettings, getBureaus, creatSafeTask, putSafeTask} from '../../utils/DataUtils'
  import {SELF_UNITS} from '../../ProjectContants'
  import {parseCreateProjectSettings, formatDate} from '../../utils/CommonUtils'
  import {closeWindow, getPageParams, openWindow, toast, uploadFile} from '../../utils/ApiCloudUtils'
  import ProjectHeader from '../../components/ProjectHeader'
  import AreaSelector from '../../components/AreaSelector'

  export default {
    name: 'app',
    components: { ProjectHeader, AreaSelector, MultiSelector, UserSelector },
    data () {
      return {
        selectedItemsIdp:[],
        isEdit:false,
        type:'',
        project:{},
        clone: false,
        paddingBottom: 0,
        originProjectName: '',
        form: {
          jpid: null,
          pname: null,
          imgUrl: '',
          num: null,
          selfUnit: null,
          selfUnitName: null,
          industry: null,
          industryName: null,
          nature: null,
          jbid: null,
          natureName: null,
          businessNature: null,
          businessNatureName: null,
          get entrustDate () {
            return this.actEntrustDate ? new Date(this.actEntrustDate).format('yyyy年MM月dd日') : null
          },
          set entrustDate (t) {
            this.actEntrustDate = t.replace('年', '/').replace('月', '/').replace('日', '')
          },
          actEntrustDate: null,
          dpid: null,
          get department () {
            return this.dpid
          },
          set department (d) {
            this.dpid = d
          },
          departmentName: null,
          contractMoney: null,
          userIncharge: null,
          userInchargeName: null,
          ownerUnit: null,
          area: null,
          areaName: null,
          specialty: null,
          specialtyName: null,
          sourceType: null,
          sourceTypeName: null,
          userDevelop: null,
          care: null,
          careName: null,
          userDevelopName: null,
          get dateLimitText () {
            if (!this.actDateLimitText) {
              return null
            }
            return new Date(this.actDateLimitText).format('yyyy年MM月dd日')
          },
          set dateLimitText (t) {
            this.actDateLimitText = t.replace('年', '/').replace('月', '/').replace('日', '')
          },
          actDateLimitText: null,
          ownerMobile: null
        },
        showAreaSelector: false,
        isEditProject: false,
        canEdit: false,
        get canSubmit () {
          if (!this.isEditProject) {
            return true
          }

          if (this.canEdit) {
            return true
          }

          return false
        },
        settings: {
          natures: [],
          businessNatures: [],
          specialties: [],
          inchargeUsers: [],
          developUsers: [],
          get userIncharges () {
            return this.inchargeUsers
          },
          get userDevelops () {
            return this.developUsers
          },
          sourceTypes: [],
          industries: [],
          areas: [],
          departments: [],
          selfUnits: SELF_UNITS
        },

        // selectors
        selectedSelfUnit: null,
        selectedIndustry: null,
        selectedNature: null,
        selectedJbid: null,
        selectedBusinessNature: null,
        selectedSpecialty: null,
        selectedSourceType: null,
        selectedDepartment: null,
        selectedUserIncharge: null,
        selectedUserDevelop: null,
        selectedCare: null,

        linkInOwnerUnitContainer: false,
        ownerUnitHistoryWords: []
      }
    },
    watch: {
      selectedSelfUnit (value) {
        this.parseMultiSelector('selfUnit', value)
      },
      selectedBusinessNature (value) {
        this.parseMultiSelector('businessNature', value)
      },
      selectedIndustry (value) {
        this.parseMultiSelector('industry', value)
      },
      selectedNature (value) {
        this.parseMultiSelector('nature', value)
      },
      selectedJbid (value) {
        this.parseMultiSelector('jbid', value)
      },
      selectedSpecialty (value) {
        this.form.specialtyName = value.map(({ text }) => text).join('、')
        this.form.specialty = value.map(({ id }) => id).join(',')
        // this.parseMultiSelector('specialty', value)
      },
      selectedSourceType (value) {
        this.parseMultiSelector('sourceType', value)
      },
      selectedDepartment (value) {
        this.parseMultiSelector('department', value)
      },
      selectedUserIncharge (value) {
        this.parseMultiSelector('userIncharge', value)
      },
      selectedUserDevelop (value) {
        console.log(value,'listtttt')
        this.form.userDevelop = []
        this.form.userDevelopName = []
        value.map(item=>{
          this.form.userDevelop.push(item.juid)
          if(item.left){
            this.form.userDevelopName.push(item.left)
          }else{
            this.form.userDevelopName.push(item.text)
          }
        })
        this.form.userDevelop = this.form.userDevelop.toString()
        // this.parseMultiSelector('userDevelop', value)
      },
      selectedCare (value) {
        this.parseMultiSelector('care', value)
      }
    },
    computed: {
      entrustText () {
        return this.form.sourceType === '1' ? '委托日期' : '中标日期'
      },
      footerHeight () {
        return this.paddingBottom + 40
      }
    },
    async created () {
      let { project,edit } = await getPageParams()
      this.project = project
      this.isEdit = edit
      console.log(project,'project000')
      // console.log(edit,'isEditProject')

      this.getSettings()
      


      // try {
      //   this.ownerUnitHistoryWords = JSON.parse(window.localStorage.getItem('project-owner-unit-history')) || []
      // } catch (e) {
      //   this.ownerUnitHistoryWords = []
      // }
      
      // await this.getPageParams()
      // this.paddingBottom = window.api.safeArea.bottom
      // this.originProjectName = this.form.pname
    },
    methods: {
      closeWindow,
      formatDate,
      saveOwnerUnitHistoryWords () {
        if (this.form.ownerUnit && !this.ownerUnitHistoryWords.includes(this.form.ownerUnit)) {
          this.ownerUnitHistoryWords.push(this.form.ownerUnit)
          while (this.ownerUnitHistoryWords.length > 5) {
            this.ownerUnitHistoryWords.shift()
          }
          window.localStorage.setItem('project-owner-unit-history', JSON.stringify(this.ownerUnitHistoryWords))
        }
      },
      linkLeaveOwnerUnit () {
        this.linkInOwnerUnitContainer = false
      },
      linkToOwnerUnit () {
        if (this.linkInOwnerUnitContainer) {
          return
        }
        setTimeout(() => {
          this.linkInOwnerUnitContainer = true
          document.getElementById('ownerUnitContainer').scrollIntoView(true)
        }, 300)
      },
      selectAreaSucceed (city) {
        this.form.areaName = city.region
        this.form.area = city.code
      },
      parseMultiSelector (field, value) {

        // this.form[field] = []
        // this.form[field + 'Name'] = []
        // value.map(item=>{
        //   this.form[field].push(item.id)
        //   if(item.left){
        //     this.form[field + 'Name'].push(item.left)
        //   }else{
        //     this.form[field + 'Name'].push(item.text)
        //   }
        // }
        
        this.form[field + 'Name'] = this.form[field + 'Name'].toString()


        if (!id || !text) {
          return
        }
        if (id === 'addNew') {
          window.api.prompt({
            title: '请输入',
            buttons: ['确定', '取消']
          }, ret => {
            if (!ret || !ret.text) {
              return
            }

            this.form[field] = ''
            this.form[field + 'Name'] = ret.text
          })
        } else {
          this.form[field] = id
          this.form[field + 'Name'] = left || text
        }
      },
      async getPageParams () {
        let { edit = false, project = null, canEdit = false, clone = false } = await getPageParams()
        this.isEditProject = edit
        this.clone = clone
        this.canEdit = canEdit
        if (project) {
          for (let key in this.form) {
            this.form[key] = project[key]
          }
          this.form.actEntrustDate = project.entrustDate ? project.entrustDate.replace('年', '/').replace('月', '/').replace('日', '') : ''
          this.form.actDateLimitText = project.dateLimitText ? project.dateLimitText.replace('年', '/').replace('月', '/').replace('日', '') : ''
          this.form.userInchargeName = project.userInchargeObject && project.userInchargeObject.juname
          this.form.userDevelopName = project.userDevelopObject && project.userDevelopObject.juname
          this.form.departmentName = project.dpName
          this.form.businessNatureName = project.businessNatureName
        }
      },
      async getSettings () {
        let { c, d } = await getProjectSettings()
        if (c === 0) {
          this.settings = Object.assign(this.settings, d)
          let res = await getBureaus()
        
          if(res.c === 0){
            let ggg = {
              jbid:res.d
            }
            let bbb= JSON.parse(JSON.stringify(ggg).replace(/name/g,"text"));
            let jbid= JSON.parse(JSON.stringify(bbb).replace(/full_text/g,"full_name"));
            this.settings = Object.assign(this.settings, jbid)
            parseCreateProjectSettings(this.settings)
            console.log(this.settings);
          }
        }


        if(this.isEdit){
          this.form.pname = this.project.taskName
          this.form.actDateLimitText = this.formatDate(this.project.taskTime*1000, 'yyyy-MM-dd')
          this.form.userDevelopName = this.project.taskMembersNameStr.split()
          this.form.userDevelop = []
          this.project.taskMemberList.map(item=>{
            this.form.userDevelop.push(item.juid)
          })
          this.form.userDevelop = this.form.userDevelop.toString()
        }
      },
      async save () {
        console.log(this.form,'this.form')
        let params = {
          taskName:this.form.pname,
          taskTime:parseInt(new Date(this.form.actDateLimitText).getTime()/1000),
          taskMemberIds:this.form.userDevelop
        }
        // let { c, d } = await creatSafeTask()
        // openWindow('project_safe.html')
        console.log(params,'params')

        let errors = {
          taskName: '请输入任务名称',
          taskTime: '请选择时间',
          taskMemberIds: '请选择参与人'
        }
        for (let field in errors) {
          if (!params[field]) {
            return toast(errors[field])
          }
        }
        if(this.isEdit){
          params.ptid = this.project.ptid
          var { c, m } = await putSafeTask(params)
        }else{
          params.jpid = this.project.jpid
          var { c, m } = await creatSafeTask(params)
        }
        if (c === 0) {
            toast(m)
            setTimeout(() => {
              closeWindow()
            }, 300)
          }
      },
      viewThisImage () {
        const photoBrowser = window.api.require('photoBrowser')
        photoBrowser.open({
          images: [this.form.imgUrl],
          bgColor: '#000'
        }, (ret, err) => {
          if (ret) {
            if (ret.eventType === 'click') {
              photoBrowser.close()
            }
          } else {
            console.error(JSON.stringify(err))
          }
        })
      },
      viewImage () {
        window.api.actionSheet({
          title: '修改项目图片',
          cancelTitle: '取消',
          buttons: ['从相册选取', '拍照', '查看当前图片']
        }, ({ buttonIndex }) => {
          if (buttonIndex === 1) {
            this.openPicture('album')
          } else if (buttonIndex === 2) {
            this.openPicture('camera')
          } else if (buttonIndex === 3) {
            this.viewThisImage()
          }
        })
      },
      openPicture (type) {
        window.api.getPicture({
          sourceType: type,
          encodingType: 'jpg',
          mediaValue: 'pic',
          destinationType: 'base64',
          allowEdit: true,
          quality: 90,
          targetWidth: 400,
          // targetHeight: 200,
          saveToPhotoAlbum: false
        }, ret => {
          if (ret) {
            this.editImage(ret)
          }
        })
      },
      async editImage ({ base64Data, data }) {
        let old = this.form.imgUrl
        this.form.imgUrl = base64Data
        let r = await uploadFile(data)
        if (r.c !== 0) {
          this.form.imgUrl = old
          return toast(r.m)
        }
        this.form.img = r.d.key
      },
      inputContractMoneyFinish () {
        const money = this.form.contractMoney / 10000
        let id = 3
        if (money >= 500) {
          id = 1
        } else if (money >= 200) {
          id = 2
        }
        this.selectedCare = this.settings.cares.filter(({ id: a }) => id === a)[0]
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .project-add-container {
        position: relative;

        .project-add-form {
            padding-bottom: 10px;
            background: #F7F8FA;

            &:last-child {
                padding-bottom: 50px;
            }

            .form-item {
              input {
                font-size: 14px;
              }
              label {
                font-size: 14px;
                color: #22242A;
                font-weight: normal;
              }
                &.selectable {
                    position: relative;
                    padding-right: 55px;

                    &:after {
                        position: absolute;
                        content: '';
                        right: 24px;
                        top: 25px;
                        width: 8px;
                        height: 8px;
                        border-right: 2px solid #CDCDD7;
                        border-bottom: 2px solid #CDCDD7;
                        -webkit-transform: rotate(-45deg);
                        -moz-transform: rotate(-45deg);
                        -ms-transform: rotate(-45deg);
                        -o-transform: rotate(-45deg);
                        transform: rotate(-45deg);
                    }
                }

                

                &.date {
                    position: relative;
                    padding-right: 50px;

                    &:after {
                        position: absolute;
                        content: '';
                        right: 22px;
                        top: 0;
                        width: 20px;
                        height: 100%;
                        background: data-uri('image/png;base64', '../../assets/images/Calendar.png') no-repeat;
                        background-position: center 20px;
                        background-size: 20px 20px;
                    }
                }
            }
            .no-border {
              &::before{
                width: 0;
              }
            }

            .form-tip {
                padding: 10px 22px 0;
                font-size: 12px;
                color: #3f67e9;
                background-color: #fff;
            }
        }
    }

    .form-item-image {
        position: relative;
        height: 74px !important;
        line-height: 74px !important;
        border-radius: 5px;


        & > img {
            position: absolute;
            top: 13px;
            right: 22px;
            width: 48px;
            height: 48px;
            border-radius: 24px;
        }
    }

    #showMask {
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 999;
    }

    .owner-unit-history {
        position: fixed;
        top: 58px;
        right: 22px;
        z-index: 1001;
        background-color: #fdfdfd;
        list-style: none;
        width: 200px;
        -webkit-box-shadow: 1px 1px 1px #666;
        box-shadow: 1px 1px 1px #666;

        &:after {
            display: none;
            position: absolute;
            right: 8px;
            top: -10px;
            content: '';
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-bottom: 10px solid #fdfdfd;
        }

        li {
            position: relative;
            padding: 10px 10px;
            font-size: 14px;
            line-height: 1;

            &:active {
                background-color: #eee;
            }

            &:not(:last-child):after {
                position: absolute;
                bottom: 0;
                left: 5px;
                right: 5px;
                height: 1px;
                content: '';
                background-color: #eee;
                -webkit-transform: scaleY(0.5);
                -moz-transform: scaleY(0.5);
                -ms-transform: scaleY(0.5);
                -o-transform: scaleY(0.5);
                transform: scaleY(0.5);
            }
        }
    }

    .project-add-form-buttons-box {
      position: fixed;
      bottom: 0;
      width: 100%;
      display: flex;
      justify-content: space-around;
      background: #fff;
      padding-bottom: 4%;
    }
    #sure-commit {
      background: #6478D3; 
    }
    #cancle-commit {
      background: #CDCDD7;
    }
    #sure-commit, #cancle-commit {
      width: 40%;
      text-align: center;
      height: 46px;
      line-height: 46px;
      border-radius: 46px;
      color: #fff !important;
    }
</style>
