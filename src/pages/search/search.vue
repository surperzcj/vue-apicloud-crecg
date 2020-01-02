<template>
    <div id="app" class="layout-container search-page-container"
         :style="{'padding-top': `${paddingTop+headerHeight}px`}">
        <div v-if="!showSearchMore">
            <div class="search-header" :style="{'padding-top': `${paddingTop}px`}">
                <div class="search-header-left" @click="closeWindow"></div>
                <div class="search-input">
                    <input type="text" class="weui-input" :placeholder="searchInputPlaceholder" v-model="searchWord"/>
                </div>
                <div class="search-header-right" @click="searchByWord">搜索</div>
            </div>
            <div class="search-history" v-if="rows === null">
                <div class="title">
                    搜索历史
                    <span @click="showSearchMore=true" v-if="isSearchProject">按条件搜索</span>
                </div>
                <ul v-if="searchHistories.length > 0">
                    <li v-for="word in searchHistories" @click="searchWord=word">
                        <img src="../../assets/images/Search.png" class="icon-search">
                        {{word}}
                    </li>
                    <li class="clear" @click="clearSearchHistory">清空历史记录</li>
                </ul>
            </div>
        </div>
        <div v-if="showSearchMore">
            <div class="search-header" style="padding-right: 44px;" :style="{'padding-top': `${paddingTop}px`}">
                <div class="search-header-left" @click="showSearchMore=false;rows=null;"></div>
                <span>按条件搜索</span>
            </div>
            <ul class="search-limit-form">
                <li class="range">
                    <div class="search-limit-form-item-title">合同额(元)</div>
                    <div class="search-limit-form-item-end">
                        <input type="text" class="weui-input" placeholder="金额（大）"
                               v-model="searchProjectForm.contractSumEnd"/>
                    </div>
                    <div class="search-limit-form-item-between">-</div>
                    <div class="search-limit-form-item-start">
                        <input type="text" class="weui-input" placeholder="金额（小）"
                               v-model="searchProjectForm.contractSumBegin"/>
                    </div>
                </li>
                <li>
                    <div class="search-limit-form-item-title">创建时间</div>
                    <div class="search-limit-form-item-end date">
                        <input type="text" class="weui-input" readonly placeholder="结束时间"
                               v-model="searchProjectForm.createDateEnd"/>
                        <input type="date" class="weui-input" v-model="searchProjectForm.createDateEndText">
                    </div>
                    <div class="search-limit-form-item-between">-</div>
                    <div class="search-limit-form-item-start date">
                        <input type="text" class="weui-input" readonly placeholder="开始时间"
                               v-model="searchProjectForm.createDateBegin"/>
                        <input type="date" class="weui-input" v-model="searchProjectForm.createDateBeginText">
                    </div>
                </li>
                <li>
                    <div class="search-limit-form-item-title">业主单位</div>
                    <div class="search-limit-form-item">
                        <input type="text" class="weui-input" placeholder="请输入业主单位"
                               v-model="searchProjectForm.ownerUnit"/>
                    </div>
                </li>
                <li>
                    <div class="search-limit-form-item-title">所属部门</div>
                    <div class="search-limit-form-item icon-down">
                        <input type="text" class="weui-input" readonly placeholder="选择所选部门"
                               @click="$refs.selectedDepartments.show()"
                               v-model="searchProjectForm.dpnames"/>
                    </div>
                </li>
                <li>
                    <div class="search-limit-form-item-title">项目负责人</div>
                    <div class="search-limit-form-item icon-down">
                        <input type="text" class="weui-input" readonly placeholder="选择项目负责人"
                               v-model="searchProjectForm.inchargeUserNames"
                               @click="$refs.selectedUserIncharges.show()"/>
                    </div>
                </li>
                <li>
                    <div class="search-limit-form-item-title">经营性质</div>
                    <div class="search-limit-form-item icon-down">
                        <input type="text" class="weui-input" readonly placeholder="选择经营性质"
                               v-model="searchProjectForm.businessNatureName"
                               @click="$refs.selectedBusinessNature.show()"/>
                    </div>
                </li>
                <li>
                    <div class="search-limit-form-item-title">项目状态</div>
                    <div class="search-limit-form-item icon-down">
                        <input type="text" class="weui-input" readonly placeholder="选择项目状态"
                               v-model="searchProjectForm.statusName"
                               @click="$refs.selectedStatus.show()"/>
                    </div>
                </li>
            </ul>
            <div class="search-limit-form-submit" @click="openSearch">开始搜索</div>
        </div>
        <ul class="users-container" v-if="rows && isSearchUsers">
            <li @click="toUserDetail(row)" v-for="row in rows">
                <div class="users-avatar">
                    <img :src="row.avatarUrl" alt="">
                </div>
                <div class="users-name" v-text="row.juname"></div>
                <div class="users-info">
                    <div>账号：<span v-text="row.mobile"></span></div>
                    <div>
                        状态：
                        <span class="users-status" :class="row.status === 1?'active':''" v-text="row.statusName"></span>
                    </div>
                </div>
            </li>
            <li class="no-data" v-if="rows.length===0">未找到数据</li>
        </ul>
        <ul class="users-container" v-if="rows && isSearchRegisters">
            <li @click="toUserDetail(row,false)" v-for="row in rows">
                <div class="users-name" v-text="row.juname"></div>
                <div class="users-info">
                    <div>账号：{{row.mobile}}</div>
                    <div>部门：<span class="users-status" v-text="row.department&&row.department.dpname"></span></div>
                </div>
            </li>
            <li class="no-data" v-if="rows.length===0">未找到数据</li>
        </ul>

        <ProjectItem :rows="rows" v-if="rows && isSearchProject"/>
        <multi-selector :list="settings.departments" multiable title="选择所属部门(多选)"
                        v-on:btn-right-click="changeDepartment" ref="selectedDepartments"/>
        <multi-selector :list="settings.userIncharges" multiable title="选择负责人(多选)"
                        v-on:btn-right-click="changeUserIncharges" ref="selectedUserIncharges"/>
        <multi-selector :list="settings.businessNatures" title="选择项目性质"
                        v-on:btn-right-click="changeBusinessNature" ref="selectedBusinessNature"/>
        <multi-selector :list="settings.statuses" title="选择项目状态"
                        v-on:btn-right-click="changeStatus" ref="selectedStatus"/>
    </div>
</template>

<script>
  import MultiSelector from '../../components/MultiSelector'
  import ProjectItem from '../../components/ProjectItem'
  import {closeWindow, getPageParams, listenPage, openWindow} from '../../utils/ApiCloudUtils'
  import {getStorage, parseCreateProjectSettings, setStorage} from '../../utils/CommonUtils'
  import {getManageUsers, getProjects, getProjectSettings, getUserRegisterApproves} from '../../utils/DataUtils'
  import {LAYOUT_HEADER_HEIGHT, SELF_UNITS} from '../../ProjectContants'

  export default {
    name: 'search',
    components: { ProjectItem, MultiSelector },
    data () {
      return {
        searchType: null,
        showSearchMore: false,
        searchHistories: [],
        rows: null,
        searchWord: null,
        paddingTop: 20,
        headerHeight: LAYOUT_HEADER_HEIGHT,
        page: 1,

        searchProjectForm: {
          contractSumBegin: null,
          contractSumEnd: null,
          createDateBeginText: null,
          createDateEndText: null,
          ownerUnit: null,
          dpids: [],
          dpnames: '',
          inchargeUsersId: [],
          inchargeUserNames: '',
          businessNature: '',
          businessNatureName: '',
          status: '',
          statusName: '',
          get createDateBegin () {
            if (!this.createDateBeginText) {
              return null
            }

            return new Date(this.createDateBeginText).format('yyyy年MM月dd日')
          },
          get createDateEnd () {
            if (!this.createDateEndText) {
              return null
            }

            return new Date(this.createDateEndText).format('yyyy年MM月dd日')
          }
        },
        settings: {
          statuses: [
            { text: '跟踪项目', id: 'track' },
            { text: '实施项目', id: 'implement' },
            { text: '完成项目', id: 'finished' }
          ],
          natures: [],
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
          businessNatures: [],
          selfUnits: SELF_UNITS
        }
      }
    },
    computed: {
      isSearchProject () {
        return this.searchType === '3'
      },
      isSearchUsers () {
        return this.searchType === '1'
      },
      isSearchRegisters () {
        return this.searchType === '2'
      },
      searchHistoryCacheKey () {
        return `user_search_history_${this.searchType}`
      },
      searchInputPlaceholder () {
        if (this.isSearchUsers || this.isSearchRegisters) {
          return '请输入手机号或姓名搜索'
        } else if (this.isSearchProject) {
          return '请输入项目名称搜索'
        }
      }
    },
    async created () {
      let { type } = await getPageParams()
      this.paddingTop = window.api.safeArea.top
      this.searchType = type
      this.getHistories()

      if (this.isSearchProject) {
        this.getProjectSettings()
      }
    },
    methods: {
      closeWindow,
      getHistories () {
        this.searchHistories = getStorage(this.searchHistoryCacheKey) || []
      },
      changeDepartment (departments) {
        this.searchProjectForm.dpids = departments.map(department => department.id)
        this.searchProjectForm.dpnames = departments.map(department => department.text)
      },
      changeUserIncharges (users) {
        this.searchProjectForm.inchargeUsersId = users.map(user => user.id)
        this.searchProjectForm.inchargeUserNames = users.map(user => user.juname)
      },
      changeBusinessNature ({ id, text }) {
        this.searchProjectForm.businessNature = id
        this.searchProjectForm.businessNatureName = text
      },
      changeStatus ({ id, text }) {
        this.searchProjectForm.status = id
        this.searchProjectForm.statusName = text
      },
      async getProjectSettings () {
        let { c, d } = await getProjectSettings()
        if (c === 0) {
          this.settings = Object.assign(this.settings, d)
          parseCreateProjectSettings(this.settings)
        }
      },
      toUserDetail (user, isUserManagement = true) {
        openWindow('user_detail.html', '用户详情', { user, isUserManagement })
      },
      async searchUsers () {
        let { c, d } = await getManageUsers(this.searchWord, 0, this.page)
        if (c !== 0) {
          return
        }
        let { rows, pages } = d
        this.rows = (this.page === 1 ? [] : this.rows).concat(rows)

        if (this.page < pages) {
          this.page++
          listenPage(() => {
            this.searchByWord()
          })
        }
      },
      async searchRegisters () {
        let { c, m, d } = await getUserRegisterApproves(this.searchWord, '', this.page)
        if (c !== 0) {
          return
        }

        let { rows, pages } = d
        this.rows = (this.page === 1 ? [] : this.rows).concat(rows)

        if (this.page < pages) {
          this.page++
          listenPage(() => {
            this.searchByWord()
          })
        }
      },
      async searchProjectsByWord () {
        let { c, d } = await getProjects({ name: this.searchWord, pageNumber: this.page, status: '' })
        if (c !== 0) {
          return
        }

        let { rows, pages } = d
        this.rows = (this.page === 1 ? [] : this.rows).concat(rows)

        if (this.page < pages) {
          this.page++
          listenPage(() => {
            this.searchByWord()
          })
        }
      },
      async searchByWord () {
        if (this.isSearchUsers) {
          this.searchUsers()
        } else if (this.isSearchRegisters) {
          this.searchRegisters()
        } else if (this.isSearchProject) {
          this.searchProjectsByWord()
        }

        this.addWordToSearchHistories()
      },
      addWordToSearchHistories () {
        if (!this.searchWord || this.searchHistories.indexOf(this.searchWord) !== -1) {
          return
        }

        let searchHistories = [this.searchWord].concat(this.searchHistories)
        if (searchHistories.length > 10) {
          searchHistories.pop()
        }

        this.searchHistories = searchHistories
        setStorage(this.searchHistoryCacheKey, searchHistories)
      },
      clearSearchHistory () {
        this.searchHistories = []
        setStorage(this.searchHistoryCacheKey, null)
      },
      openSearch () {
        openWindow('project_search_result.html', '搜索结果', { searchProjectForm: this.searchProjectForm })
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .search-page-container {
        padding-top: @layoutHeight+@headerPaddingTop;

        li.no-data {
            line-height: 37px;
            font-size: 16px;
            text-align: center;
            color: red;
            letter-spacing: 3px;

            &:before {
                display: none;
            }
        }

    }

    .search-header {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        line-height: @layoutHeight;
        background-color: #fff;
        color: #444;
        text-align: center;
        padding-top: @headerPaddingTop;
        padding-left: @layoutHeight;
        padding-right: 60px;
        z-index: 99;

        .search-header-left {
            position: absolute;
            bottom: 0;
            left: 0;
            height: @layoutHeight;
            width: @layoutHeight;

            &:before {
                position: absolute;
                content: ' ';
                left: 50%;
                top: 50%;
                width: @backSize;
                height: @backSize;
                margin-left: -@backSize/2px;
                margin-top: -@backSize/2px;
                border-left: 1px solid #444;
                border-bottom: 1px solid #444;
                -webkit-transform: rotate(45deg);
                transform: rotate(45deg);
            }
        }

        .search-header-right {
            position: absolute;
            bottom: 0;
            right: 0;
            height: @layoutHeight;
            width: 50px;
            font-size: 14px;
            letter-spacing: 1px;
            text-align: left;
            color: @baseColor;
        }

        .search-input {
            position: relative;
            width: 100%;

            & > input {
                padding-left: 36px;
                height: 36px;
                line-height: 36px;
                border-radius: 18px;
                color: #7f7f7f;
                background-color: #ededec;
            }

            &:before {
                position: absolute;
                left: 0;
                bottom: 4px;
                content: '';
                width: 36px;
                height: 36px;
                background-image: data-uri('image/png;base64', '../../assets/images/Search.png');
                background-position: center;
                background-repeat: no-repeat;
                background-size: 14px auto;
            }
        }
    }

    .search-history {
        color: #7f7f7f;

        .title {
            padding: 0 22px;
            line-height: 35px;
            color: #8D92A3;
            font-size: 12px;

            span {
                position: relative;
                float: right;
                color: @baseColor;

                &:before {
                    position: absolute;
                    content: '';
                    top: 0;
                    left: -20px;
                    width: 20px;
                    height: 35px;
                    background-image: data-uri('image/png;base64', '../../assets/images/icon-search-limit.png');
                    background-repeat: no-repeat;
                    background-position: center;
                    background-size: 13px auto;
                }
            }
        }

        ul {
            list-style: none;
            padding: 0 20px;

            li {
                position: relative;
                padding-left: 30px;
                height: 62px;
                line-height: 62px;
                min-height: 37px;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                font-size: 14px;
                color: #22242A;

                .icon-search {
                    position: absolute;
                    left: 0;
                    top: 22px;
                    height: 20px;
                    width: 20px;
                }

                &:before {
                    position: absolute;
                    content: '';
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: rgb(212, 212, 211);
                    -webkit-transform: scaleY(0.5);
                    -moz-transform: scaleY(0.5);
                    -ms-transform: scaleY(0.5);
                    -o-transform: scaleY(0.5);
                    transform: scaleY(0.5);
                }

                &:not(.clear):after {
                    position: absolute;
                    content: '';
                    bottom: 0;
                    right: 0;
                    width: 20px;
                    height: 62px;
                    background-image: data-uri('image/png;base64', '../../assets/images/icon-header-back.png');
                    background-repeat: no-repeat;
                    background-position: left center;
                    background-size: 18px;
                    -webkit-transform: rotate(180deg);
                    -moz-transform: rotate(180deg);
                    -ms-transform: rotate(180deg);
                    -o-transform: rotate(180deg);
                    transform: rotate(180deg);
                }

                &.clear {
                    color: #b0b0b0;
                    padding: 0;
                    text-align: center;
                }
            }
        }
    }

    .search-limit-form {
        padding: 0 20px;
        color: #22242a;
        list-style: none;

        li {
            position: relative;
            height: 62px;
            width: 100%;
            line-height: 62px;
            font-size: 14px;

            &::after {
              position: absolute;
              content: '';
              bottom: 0;
              left: 0;
              right: 0;
              height: 1px;
              background: #dadada;
              -webkit-transform: scaleY(0.5);
              -moz-transform: scaleY(0.5);
              -ms-transform: scaleY(0.5);
              -o-transform: scaleY(0.5);
              transform: scaleY(0.5);
              width: 100%;
            }

            .search-limit-form-item-title {
                position: absolute;
                left: 0;
                top: 0;
            }

            .search-limit-form-item-start, .search-limit-form-item-end {
                float: right;
                width: 96px;
                font-size: 12px;

                input {
                    padding: 0 10px;
                    height: 22px;
                    background: #F1F3F8;
                    border-radius: 14.5px;
                }

                &.date {
                    position: relative;

                    input[type=text] {
                        position: absolute;
                        left: 0;
                        top: 20px;
                        pointer-events: none;
                        z-index: 100;
                    }
                }
            }

            .search-limit-form-item-between {
                float: right;
                width: 12px;
                text-align: center;
            }

            .search-limit-form-item {
                text-align: right;
                padding-left: 70px;
                padding-right: 25px;

                input {
                    text-align: right;
                }

                &.icon-down {
                    position: relative;
                    padding-right: 25px;

                    &:after {
                        position: absolute;
                        content: '';
                        bottom: 0;
                        right: 0;
                        width: 20px;
                        height: 62px;
                        background-image: data-uri('image/png;base64', '../../assets/images/Details.png');
                        background-repeat: no-repeat;
                        background-position: left center;
                        background-size: 18px;
                        // -webkit-transform: rotate(180deg);
                        // -moz-transform: rotate(180deg);
                        // -ms-transform: rotate(180deg);
                        // -o-transform: rotate(180deg);
                        // transform: rotate(180deg);
                    }
                }
            }
        }
    }

    .search-limit-form-submit {
        position: fixed;
        width: 89%;
        bottom: 4%;
        margin: 28px 22px 0;
        height: 46px;
        text-align: center;
        line-height: 46px;
        -webkit-border-radius: 17px;
        -moz-border-radius: 17px;
        border-radius: 23px;
        color: #fff;
        background: #6478D3;

        &:active {
            background-color: @baseColorActive;
        }
    }

</style>
