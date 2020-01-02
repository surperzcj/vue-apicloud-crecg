<template>
    <div id="app" :class="{'projects-statuses-fix': !hideSubtitle}" style="background-color: #fff;">
        <ul class="projects-statuses" v-if="!hideSubtitle">
            <li :class="h.className" class="btn-animation-ripple" v-for="(h,headerIndex) in headers" :key="headerIndex" v-text="h.name"
                @click="tabHeader(headerIndex)">
                <div class="btn-animation-ripple-content"></div>
            </li>
        </ul>
        <div class="weui-flex projects-sorts" v-if="!hideSubtitle">
            <div class="weui-flex__item btn-animation-ripple select" :class="{active: selectingReturn}"
                 @click="selectingReturn = !selectingReturn" v-if="showFilter">
                <div class="btn-animation-ripple-content-mini"></div>
                {{clearMoneyName}}
                <span></span>
            </div>
            <div class="weui-flex__item btn-animation-ripple sort" @click="projectSort('created')"
                 :class="form.sortField === 'created' ? form.sortType : ''">
                <div class="btn-animation-ripple-content-mini"></div>
                创建时间
            </div>
            <div class="weui-flex__item btn-animation-ripple sort" @click="projectSort('signTime')"
                 :class="form.sortField === 'signTime' ? form.sortType : ''">
                <div class="btn-animation-ripple-content-mini"></div>
                签订时间
            </div>
            <div class="weui-flex__item btn-animation-ripple sort" @click="projectSort('contractMoney')"
                 :class="form.sortField === 'contractMoney' ? form.sortType : ''">
                <div class="btn-animation-ripple-content-mini"></div>
                合同金额
            </div>
        </div>
        <div class="project-count-sum" v-if="hideSubtitle">共<span v-text="form.total"></span>个</div>
        <!-- <div class="project-count-all-numbers weui-flex" v-else>
            <div style="width: 26%;"><b>共<font>{{projectCounts.all}}</font>项目</b></div>
            <div class="weui-flex__item">跟踪：{{projectCounts.tracking}}</div>
            <div class="weui-flex__item">实施：{{projectCounts.impling}}</div>
            <div class="weui-flex__item">完成：{{projectCounts.finished}}</div>
        </div> -->
        <ProjectItem :rows="rows" show-progress-percent show-income-percent show-tag/>
        <transition name="slide-fade">
          <ul class="select-container" v-if="selectingReturn" :class="{bounceInDown: selectingReturn}">
              <li v-for="{id,name} in clearMoneyItems" v-text="name"
                  :key="id"
                  :class="{active: id === sd}"
                  @click="selectClearMoneyItem(id, name)">
              </li>
          </ul>
        </transition>
        <div class="weui-mask"
              @touchmove.prevent
             @click="selectingReturn = false"
             v-if="selectingReturn"
        >
        </div>
    </div>
</template>

<script>
  import _ from 'lodash'
  import {
    getPageParams,
    listenPage,
    pullRefresh,
    pullRefreshDone,
    addEventListener,
    sendEvent
  } from '../../utils/ApiCloudUtils'
  import ProjectItem from '../../components/ProjectItem'
  import {getProjectCounts, getProjects, getDepartments, getUsers} from '../../utils/DataUtils'
  import {concatUnique} from '../../utils/CommonUtils'

  export default {
    name: 'app',
    components: { ProjectItem },
    data () {
      return {
        headers: [
          {
            name: '全部', active: false, status: 'all',
            get className () {
              return this.active ? 'active' : ''
            }
          },
          {
            name: '跟踪', active: false, status: 'track',
            get className () {
              return this.active ? 'active' : ''
            }
          },
          {
            name: '实施', active: false, status: 'implement',
            get className () {
              return this.active ? 'active' : ''
            }
          },
          {
            name: '已完成', active: false, status: 'finished',
            get className () {
              return this.active ? 'active' : ''
            }
          }
        ],
        clearMoneyName:'全部',
        hideSubtitle: false,
        rows: [],
        selectingReturn: false,
        clearMoneyItems: [
          // { id: null, name: '全部' },
          // { id: true, name: '已款清' },
          // { id: false, name: '未款清' }
        ],
        screen:{
          tail:[
            // { id: null, name: '全部' },
            // { id: null, name: '桥检' },
            // { id: true, name: '工检' },
            // { id: false, name: '地灾' }
          ],
          carry:[
            // { id: null, name: '全部' },
            // { id: null, name: '张勇' },
            // { id: true, name: '熊昌盛' },
            // { id: false, name: '刘伯奇' },
            // { id: false, name: '李传勇' },
            // { id: false, name: '张宇胜' },
            // { id: false, name: '占重志' },
            // { id: false, name: '卢博祎' },
            // { id: false, name: '胡海天' }
          ],
          complete:[
            { id: null, name: '全部' },
            { id: true, name: '已款清' },
            { id: false, name: '未款清' }
          ]
        },
        sd:null,
        form: {
          area: null,
          page: 1,
          total: 0,
          status: null,
          sortField: 'created',
          sortType: 'desc',
          clearMoney: null,
          memberNames:null,
          dpidsText:null
        },
        projectCounts: {
          all: 0,
          impling: 0,
          finished: 0,
          tracking: 0
        },
        p1rojectCounts: {
          all: 294,
          impling: 263,
          finished: 3,
          tracking: 28
        }
      }
    },
    async created () {
      let depart = await getDepartments()
      let users = await getUsers()
      let temp = { id: null, name: '全部' }
      depart.d.unshift(temp)
      users.d.unshift(temp)
      this.screen.tail = depart.d
      this.screen.carry = users.d

      let { hideSubtitle = false, area = null } = await getPageParams()
      this.hideSubtitle = hideSubtitle
      this.form.area = area

      if (!this.hideSubtitle) {
        this.tabHeader(0)
      } else {
        this.getData()
      }

      addEventListener('home-windowViewAppear', ({ winName }) => {
        if (winName !== window.api.winName) {
          return
        }
        this.getData()
      })
    },
    mounted () {
      pullRefresh(async () => {
        this.form.pageNumber = 1
        this.rows = []
        await this.getData()
        pullRefreshDone()
      })
    },
    methods: {
      tabHeader (index) {
        this.form.memberNames = null
        this.form.dpidsText = null
        this.form.clearMoney = null
        this.form.devUsersIdText = null
        this.sd = null
        this.clearMoneyName = '全部'
        switch(index){
          case 0:
            break;
          case 1:
            this.clearMoneyItems = this.screen.carry
            break;
          case 2:
            this.clearMoneyItems = this.screen.tail
            break;
          case 3:
            this.clearMoneyItems = this.screen.complete
            break;
        }
        this.selectingReturn = false
        this.headers.forEach((header, headerIndex) => {
          if (index === headerIndex) {
            header.active = true
            this.form.status = header.status
          } else {
            header.active = false
          }
        })
        this.form.pageNumber = 1
        this.getData()
      },
      async getData () {
        let params = Object.assign({}, this.form)
        console.log('params');
        console.log(params);
        this.form.pageNumber === 1 && this.calcProjectCounts()
        let { c, d } = await getProjects(params)
        if (c !== 0) {
          return
        }

        let { rows, pages, total, extras } = d
        // this.rows = (this.form.pageNumber === 1 ? [] : this.rows).concat(rows)
        this.rows = concatUnique(this.form.pageNumber === 1 ? [] : this.rows, rows, 'jpid')
        this.form.total = total

        sendEvent('userCanCreateProject', { value: extras.buttons.includes('create-project') })
        setTimeout(() => {
          sendEvent('userCanCreateProject', { value: extras.buttons.includes('create-project') })
        }, 300)

        if (this.form.pageNumber < pages) {
          listenPage(() => {
            this.form.pageNumber++
            this.getData()
          })
        }
      },
      async calcProjectCounts () {
        const { c, m, d } = await getProjectCounts()
        if (c === 0) this.projectCounts = d
      },
      async projectSort (field) {
        if (field === this.form.sortField) {
          this.form.sortType = this.form.sortType === 'desc' ? 'asc' : 'desc'
        } else {
          this.form.sortField = field
          this.form.sortType = 'desc'
        }
        this.form.pageNumber = 1
        this.getData()
      },
      selectClearMoneyItem (id, name) {
        this.sd = id
        this.form.clearMoney = null
        this.form.memberNames = null
        this.form.dpidsText = null
        this.form.devUsersIdText = null
        switch (this.form.status){
          case 'all':
            break;
          case 'track':
            this.form.dpidsText = id
            break;
          case 'implement':
            this.form.devUsersIdText = id
            break;
          case 'finished':
            this.form.clearMoney = id
            break;
        }
        this.clearMoneyName = name


        this.selectingReturn = false
        this.form.pageNumber = 1
        this.getData()
      }
    },
    computed: {
      showFilter () {
        try {
          const { status } = _.find(this.headers, { active: true })
          return status !== 'all'
        } catch (e) {
          return false
        }
      },
      // clearMoneyName () {
      //   const { name } = _.find(this.clearMoneyItems, { id: this.form.clearMoney })
      //   return name
      // }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    @leftMenuWidth: 72px;

    .slide-fade-enter-active {
      transition: all .2s ease;
    }
    .slide-fade-leave-active {
      transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    }
    .slide-fade-enter, .slide-fade-leave-to
    /* .slide-fade-leave-active for below version 2.1.8 */ {
      transform: translateY(-10px);
      opacity: 0;
    }

    body {
        background: #fafafc;
        min-height: 100vh;
    }

    // .projects-statuses-fix {
    //     padding-left: @leftMenuWidth;
    // }

    .select-container {
        position: fixed;
        top: 80px;
        left: 0;
        right: 0;
        background-color: white;
        z-index: 1001;
        border-radius: 5px;
        li {
            font-size: 13px;
            line-height: 42px;
            text-align: center;

            &.active {
                color: @baseColor;
            }
        }
    }

    .projects-statuses {
        position: fixed;
        // left: 0;
        top: 0;
        // bottom: 0;
        // width: @leftMenuWidth;
        width: 100%;
        height: 40px;
        z-index: 1001;
        overflow: auto;
        background: #f8f8f8;
        // padding-top: 44px;
        display: flex;
        background: #fff;
        border-bottom: 1px solid #F1F3F8;

        li {
            height: 40px;
            line-height: 40px;
            padding-left: 17px;
            font-size: 13px;
            color: #868686;
            flex: 1;

            &.active {
                color: #070505;
                background-color: #fefefe;
            }
        }
    }

    .project-count-sum {
        padding: 20px 20px 0 20px;
        font-size: 15px;
        color: #000;

        span {
            margin-left: 3px;
            margin-right: 3px;
            color: @baseColor;
            font-size: 17px;
        }
    }

    .project-count-all-numbers {
        padding-top: 90px;
        line-height: 38px;
        background-color: #f2f5ff;
        font-size: 12px;
        text-align: center;

        b {
            color: #000000;

            font {
                color: @baseColor;
            }
        }

        .weui-flex__item {
            color: #868686;
        }
    }

    .projects-sorts {
        position: fixed;
        // left: @leftMenuWidth;
        // right: 0;
        top: 40px;
        text-align: center;
        color: #070505;
        line-height: 42px;
        font-size: 13px;
        z-index: 1001;
        height: 42px;
        background-color: #fff;
        display: flex;
        width: 100%;

        & ~ .projects-container {
            padding-top: 100px !important;
            background: #ffffff !important;
        }

        &:after {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            content: '';
            background-color: #d4d4d3;
            -webkit-transform: scaleY(0.5);
            -moz-transform: scaleY(0.5);
            -ms-transform: scaleY(0.5);
            -o-transform: scaleY(0.5);
            transform: scaleY(0.5);
        }

        .select {
            position: relative;
            font-weight: 900;
            font-size: 11px;
            color: #8D92A3;

            span {
                display: inline-block;
                margin-left: 4px;
                width: 8px;
                height: 8px;
                border-right: 1px solid #8D92A3;
                border-bottom: 1px solid #8D92A3;
                vertical-align: 2px;
                -webkit-transform: rotate(45deg);
                transform: rotate(45deg);
                font-size: 11px;
                color: #8D92A3;
            }

            &.active {
                color: @baseColor;

                span {
                    vertical-align: -1px;
                    transform: rotate(225deg);
                    border-color: @baseColor;
                }
            }
        }

        .sort {
            position: relative;
            padding-right: 5px;
            font-size: 11px;
            color: #8D92A3;

            &:before {
                position: absolute;
                top: 50%;
                right: 50%;
                margin-top: -7px;
                margin-right: -33px;
                content: '';
                width: 0;
                height: 0;
                border-left: 2px solid transparent;
                border-right: 2px solid transparent;
                border-bottom: 5px solid #868686;
            }

            &:after {
                position: absolute;
                bottom: 50%;
                right: 50%;
                margin-bottom: -7px;
                margin-right: -33px;
                content: '';
                width: 0;
                height: 0;
                border-left: 2px solid transparent;
                border-right: 2px solid transparent;
                border-top: 5px solid #868686;
            }

            &.asc:before {
                border-bottom-color: #070505;
            }

            &.desc:after {
                border-top-color: #070505;
            }
        }
    }
</style>
