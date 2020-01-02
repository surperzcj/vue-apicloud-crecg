<template>
    <div id="app" class="project-add-container">
        <div id="showMask" v-if="!canSubmit"></div>
        <ProjectHeader v-if="isEditProject && !clone" :project="this.form"/>
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
        <UserSelector title="选择人员" v-model="selectedUserIncharge" :list="settings.userIncharges" ref="userIncharge"/>
        <UserSelector title="选择人员" v-model="selectedUserDevelop" :list="settings.userDevelops" ref="userDevelop"/>
        <MultiSelector title="选择关注度" v-model="selectedCare" :list="settings.cares" ref="care"/>
        <div class="weui-mask" style="background-color: transparent"
             @click="linkLeaveOwnerUnit" v-if="linkInOwnerUnitContainer && ownerUnitHistoryWords.length > 0">
        </div>
        <ul class="owner-unit-history" v-if="linkInOwnerUnitContainer && ownerUnitHistoryWords.length > 0">
            <li v-for="(word,index) in ownerUnitHistoryWords" v-text="word" :key="index"
                @click="form.ownerUnit = word; linkLeaveOwnerUnit()"></li>
        </ul>

        <div class="project-add-form">
            <!-- <div class="form-tip" v-if="clone">* 你正在克隆【{{originProjectName}}】项目</div> -->
            <div class="form-item form-item-image" @click="viewImage">
                <label>项目图片</label>
                <img :src="form.imgUrl" v-if="form.imgUrl">
                <img src="../../assets/images/project-default-image.png" v-else>
                <input type="hidden" placeholder="请输入项目图片" v-model="form.img"/>
            </div>
            <div class="form-item">
                <label><span style='color:red;'>*</span>项目名称</label>
                <input type="text" placeholder="请输入项目名称" v-model="form.pname"/>
            </div>
            <div class="form-item">
                <label>题号</label>
                <input type="text" placeholder="请输入题号" v-model="form.num"/>
            </div>
            <div class="form-item selectable">
                <label><span style='color:red;'>*</span>我方单位</label>
                <input type="text" readonly placeholder="请选择单位" @click="$refs.selfUnit.show()"
                       v-model="form.selfUnitName">
            </div>
            <div class="form-item selectable">
                <label>关注度</label>
                <input type="text" placeholder="请选择关注度" readonly @click="$refs.care.show()"
                       v-model="form.careName">
            </div>
            <div class="form-item no-border" id="ownerUnitContainer">
                <label><span style='color:red;'>*</span>业主单位</label>
                <input type="text" placeholder="请输入业主单位" v-model="form.ownerUnit"
                       @blur="linkLeaveOwnerUnit"
                       @focus="linkToOwnerUnit"/>
            </div>
        </div>
        <div class="project-add-form">
            <div class="form-item selectable">
                <label><span style='color:red;'>*</span>行业</label>
                <input type="text" placeholder="请选择行业" readonly @click="$refs.industry.show()"
                       v-model="form.industryName">
            </div>

            <div class="form-item" v-if="form.industryName === '国家铁路'">
              <label>所属路局</label>
              <input type="text" placeholder="请选择路局" readonly  @click="$refs.jbid.show()" v-model="form.jbidName">
            </div>
            <div class="form-item" v-else>
                <label>所属区域</label>
                <input type="text" placeholder="请选择区域" readonly @click="showAreaSelector=true" v-model="form.areaName">
            </div>
            <div class="form-item selectable">
                <label><span style='color:red;'>*</span>项目性质</label>
                <input type="text" placeholder="请选择性质" readonly @click="$refs.nature.show()" v-model="form.natureName">
            </div>
            <div class="form-item selectable">
                <label>专业</label>
                <input type="text" placeholder="请选择专业" readonly @click="$refs.specialty.show()"
                       v-model="form.specialtyName">
            </div>
            <div class="form-item selectable no-border">
                <label>经营性质</label>
                <input type="text" placeholder="请选择经营性质" readonly @click="$refs.businessNature.show()"
                       v-model="form.businessNatureName">
            </div>
        </div>
        <div class="project-add-form">
            <div class="form-item selectable">
                <label>项目来源</label>
                <input type="text" placeholder="请选择来源" readonly @click="$refs.sourceType.show()"
                       v-model="form.sourceTypeName">
            </div>
            <div class="form-item date" v-if="entrustText !== '中标日期'">
                <label v-text="entrustText"></label>
                <input type="text" :placeholder="`请选择${entrustText}`" v-model="form.entrustDate" disabled/>
                <input type="date" class="project-add-form-date" v-model="form.actEntrustDate">
            </div>
            <div class="form-item selectable">
                <label>归属部门</label>
                <input type="text" placeholder="请选择归属部门" readonly @click="$refs.department.show()"
                       v-model="form.departmentName">
            </div>
            <!--<div class="form-item selectable">-->
            <!--<label>项目负责人</label>-->
            <!--<input type="text" placeholder="请选择人员" readonly @click="$refs.userIncharge.show()"-->
            <!--v-model="form.userInchargeName">-->
            <!--</div>-->
            <div class="form-item selectable no-border">
                <label><span style='color:red;'>*</span>项目跟踪人</label>
                <input type="text" placeholder="请选择人员" readonly @click="$refs.userDevelop.show()"
                       v-model="form.userDevelopName"/>
            </div>
        </div>
        <div class="project-add-form" style="padding-bottom: 80px; background: #fff;">
            <div class="form-item">
                <label><span style='color:red;'>*</span>合同额（元）</label>
                <input type="number" placeholder="请输入金额" v-model="form.contractMoney"
                       @input="inputContractMoneyFinish"/>
            </div>
            <div class="form-item date">
                <label>合同约定工期</label>
                <input type="text" placeholder="请选择日期" disabled v-model="form.dateLimitText"/>
                <input type="date" class="project-add-form-date" v-model="form.actDateLimitText">
            </div>
            <div class="form-item">
                <label><span style='color:red;'>*</span>业主联系电话</label>
                <input type="text" placeholder="请输入电话" v-model="form.ownerMobile"/>
            </div>
        </div>
        <div class="project-add-form-buttons-box" v-if="canSubmit" >
            <div class="sure" id="sure-commit"  @click="save"
                 v-text="isEditProject?'确认修改':'确认添加'"></div>
            <div class="cancel" id="cancle-commit" 
                 @click="closeWindow" v-text="isEditProject?'取消修改':'取消添加'"></div>
        </div>
    </div>
</template>

<script>
  import MultiSelector from '../../components/MultiSelector'
  import UserSelector from '../../components/UserSelector'
  import {createProject, editProject, getProjectSettings, getBureaus} from '../../utils/DataUtils'
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
        project: null,

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
        this.parseMultiSelector('userDevelop', value)
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
      try {
        this.ownerUnitHistoryWords = JSON.parse(window.localStorage.getItem('project-owner-unit-history')) || []
      } catch (e) {
        this.ownerUnitHistoryWords = []
      }
      this.getSettings()
      await this.getPageParams()
      this.paddingBottom = window.api.safeArea.bottom
      this.originProjectName = this.form.pname
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
      parseMultiSelector (field, { id, text, left }) {
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
      },
      async save () {
        this.saveOwnerUnitHistoryWords()
        let errors = {
          pname: '请输入项目名称',
          // num: '请输入题号',
          // care: '请选择关注度',
          selfUnit: '请选择我方单位',
          industry: '请选择行业',
          nature: '请选择项目性质',
          // jbid: '请选择所属路局',
          // dpid: '请选择所属部门',
          userDevelopName: '请输入项目跟踪人',
          contractMoney: '请输入合同金额',
          ownerMobile: '请填写业主电话',
          ownerUnit: '请填写业主单位',
          // area: '请选择区域',
          // specialty: '请选择专业'
          // sourceType: '请选择项目来源',
          // dateLimitText: '请选择约定工期'
        }
        for (let field in errors) {
          if (!this.form[field]) {
            return toast(errors[field])
          }
        }
        if (this.isEditProject && !this.clone) {
          let opts = [
            'jpid',
            'img',
            'pname',
            'num',
            'selfUnit',
            'industry',
            'nature',
            'jbid',
            'entrustDate',
            'dpid',
            'contractMoney',
            'userIncharge',
            'ownerUnit',
            'ownerMobile',
            'area',
            'specialty',
            'sourceType',
            'userDevelop',
            'dateLimitText',
            'care',
            'businessNature'
          ]

          let params = {}
          opts.forEach(field => params[field] = this.form[field])

          let { c, m } = await editProject(params)
          if (c === 0) {
            toast(m)
            closeWindow()
          }
        } else {
          let params = Object.assign({}, this.form)
          params.jpid = null
          let { c, m, d } = await createProject(params)
          if (c === 0) {
            toast(m)
            setTimeout(() => {
              openWindow('project_detail.html', '项目详情', { project: { jpid: d } })
            }, 300)
            setTimeout(() => {
              closeWindow()
            })
          }
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
