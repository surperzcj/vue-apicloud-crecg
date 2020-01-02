<template>
    <div class="layout-container">
        <JHeader :title="header.title" :show-search="header.showSearch"
                 v-on:btnLeftClick="btnLeftClick" v-on:btnRightClick="btnRightClick"
                 :btn-right="header.btnRight" :show-location="header.showLocation" v-show="showHeader"
                 :isMove="header.isMove"
                 />
        <div class="layout-content">
            &nbsp;
        </div>
        <div class="layout-footer" :style="{'padding-bottom': paddingBottom,height: (50+paddingBottom)+'px'}">
            <div class="layout-footer-item btn-animation-ripple" :class="bindPageClass(page)"
                 v-for="(page,pageIndex) in pages"
                 @click="tabPage(pageIndex)">
                <div class="btn-animation-ripple-content"></div>
                <span>
                    <img :src="page.active?page.activeIcon:page.icon" alt="">
                </span>
                <div>{{page.title}}</div>
            </div>
        </div>
    </div>
</template>

<script>
  import JHeader from '../../components/JHeader'
  import {getUserData} from '../../utils/CacheUtils'
  import {
    openFrameGroup,
    openWindow,
    setFrameGroupIndex,
    sendEvent,
    addEventListener,
    apiReady
  } from '../../utils/ApiCloudUtils'
  import {getUserUnreadMessageNumber} from '../../utils/Sqlite'
  import {LAYOUT_FOOTER_HEIGHT, LAYOUT_HEADER_HEIGHT} from '../../ProjectContants'

  export default {
    name: 'home',
    components: {
      JHeader
    },
    data () {
      let pages = this.getPages()

      return {
        pages: pages,
        unreadMessageNumber: 0,
        canCreateProject: false,
        header: {
          title: null,
          showSearch: false,
          btnRight: null,
          showLocation: false,
          isMove: false
        },
        currentPageIndex: 0,
        paddingBottom: 0
      }
    },
    async mounted () {
      // this.isMoveLeft()
      await apiReady()
      this.tabPage(0)
      this.paddingBottom = window.api.safeArea.bottom

      const headerHeight = LAYOUT_HEADER_HEIGHT + window.api.safeArea.top
      const footerHeight = LAYOUT_FOOTER_HEIGHT + window.api.safeArea.bottom

      let opts = {
        name: 'home_content',
        rect: {
          x: 0,
          y: headerHeight,
          w: window.innerWidth,
          h: window.innerHeight - headerHeight - footerHeight
        },
        frames: this.pages,
        scrollEnabled: false
      }

      openFrameGroup(opts, (ret, error) => {
        if (ret) {
          this.handlePageScroll(ret.index)
        }
      })

      addEventListener('user-logout', () => {
        this.$emit('logout')
        window.api.closeFrameGroup({
          name: 'home_content'
        })
      })

      addEventListener('rongcloud_get_message', () => {
        this.checkHasUnreadMessages()
      })
      addEventListener('read_message', () => {
        this.checkHasUnreadMessages()
      })
      addEventListener('viewappear', () => {
        sendEvent('home-windowViewAppear', { winName: window.api.winName })
      })
      addEventListener('userCanCreateProject', ({ value }) => {
        this.canCreateProject = value
        this.handlePageScroll(this.currentPageIndex)
      })
      this.checkHasUnreadMessages()
    },
    methods: {
      // isMoveLeft () {
      //   if(this.header.title == '用户管理' || this.header.title == '注册审批' || this.header.title == '项目管理') {
      //     this.header.isMove = true
      //   }
      // },
      async checkHasUnreadMessages () {
        this.unreadMessageNumber = await getUserUnreadMessageNumber()
      },
      bindPageClass (page) {
        let classes = []
        if (page.active) {
          classes.push('active')
        }

        if (page.showUnread) {
          classes.push('show-unread')
        }

        if (this.unreadMessageNumber > 0) {
          classes.push('show-unread-true')
        }

        return classes.join(' ')
      },
      getPages () {
        let pages = [
          {
            title: '用户管理',
            active: false,
            url: 'users.html',
            name: 'users.html',
            icon: require('../../assets/images/home-tab-users.png'),
            activeIcon: require('../../assets/images/home-tab-users-active.png'),
            showSearch: true,
            type: '1',
          },
          {
            title: '注册审批',
            active: false,
            url: 'registers.html',
            name: 'registers.html',
            icon: require('../../assets/images/home-tab-registers.png'),
            activeIcon: require('../../assets/images/home-tab-registers-active.png'),
            showSearch: true,
            type: '2',
          },
          {
            title: '项目管理',
            showSearch: true,
            active: false,
            url: 'projects.html',
            name: 'projects.html',
            btnRight: this.createProjectConfig,
            icon: require('../../assets/images/home-tab-projects.png'),
            activeIcon: require('../../assets/images/home-tab-projects-active.png'),
            type: '3'
          },
          {
            title: '微聊',
            headTitle: '微聊',
            active: false,
            url: 'smallTalk.html',
            name: 'smallTalk.html',
            icon: require('../../assets/images/home-tab-users.png'),
            activeIcon: require('../../assets/images/home-tab-users-active.png'),
          },
          {
            showUnread: true,
            title: '我的',
            headTitle: '个人中心',
            active: false,
            url: 'profile.html',
            name: 'profile.html',
            icon: require('../../assets/images/home-tab-profile.png'),
            activeIcon: require('../../assets/images/home-tab-profile-active.png'),
            type: '4'
          },
        ]

        const data = getUserData() || { dpid: 0 }
        if (data.dpid === 5 || data.haveAdminPower) {
        } else if (data.dpid) {
          pages.splice(1, 1)
        } else {
          pages = []
        }
        return pages
      },
      tabPage (index) {
        this.currentPageIndex = index
        setFrameGroupIndex({ name: 'home_content', index })
        this.handlePageScroll(index)
      },
      handlePageScroll (index) {
        this.currentPageIndex = index
        if (this.currentPageIndex === 0) {
          sendEvent('root-users-scroll')
        }
        this.pages.forEach((page, pageIndex) => {
          if (index === pageIndex) {
            page.active = true
            this.header.btnRight = page.type === '3' ? this.createProjectConfig : page.btnRight
            this.header.showSearch = page.showSearch
            this.header.title = page.headTitle || page.title
            this.header.showLocation = this.header.btnRight && this.header.btnRight.showLocation
            this.header.isMove = true
          } else {
            page.active = false
          }
        })

        // 当切换到个人中心的时候，隐藏header，修改frameGroup属性
        let headerHeight = LAYOUT_HEADER_HEIGHT + (window.api.safeArea && window.api.safeArea.top || 0)
        if (!this.showHeader) headerHeight = 0
        const footerHeight = LAYOUT_FOOTER_HEIGHT + (window.api.safeArea && window.api.safeArea.bottom || 0)

        // alert(`showHeader: ${this.showHeader}\nheaderHeight: ${headerHeight}`)
        window.api.setFrameGroupAttr({
            name: 'home_content',
            rect: {
              x: 0,
              y: headerHeight,
              w: window.innerWidth,
              h: window.innerHeight - headerHeight - footerHeight
            }
          }
        )
      },
      btnLeftClick () {
        // sendEvent('home_header_btn_left_click', this.currentPageIndex);
        window.api.openWin({
          url: 'search.html',
          name: 'search',
          pageParam: {
            type: this.pages[this.currentPageIndex].type
          }
        })
      },
      btnRightClick () {
        let page = this.getPages()[this.currentPageIndex]
        if (!page.btnRight) {
          return
        }

        if (page.btnRight.openWindow) {
          let { title, url } = page.btnRight
          openWindow(url, title)
        }
      }
    },
    computed: {
      createProjectConfig () {
        return this.canCreateProject ? {
          text: '+',
          openWindow: true,
          title: '添加项目',
          url: 'project_add.html',
          showLocation: true,
          style: 'font-size:28px;'
        } : {
          text: '',
          openWindow: false,
          title: '添加项目',
          url: 'project_add.html',
          showLocation: true,
          style: 'font-size:28px;'
        }
      },
      showHeader () {
        return this.pages.length - this.currentPageIndex !== 1
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    html, body, #app {
        height: 100%;
    }

    .layout-footer {
        padding: 7px 0;
        background-color: #f7f7f7;

        .layout-footer-item {
            line-height: 1;

            img {
                height: 20px;
                margin-bottom: 5px;
            }

            div:not(.btn-animation-ripple-content) {
                text-align: center;
                font-size: 10px;
                line-height: 10px;
            }

            .btn-animation-ripple-content {
                @size: 15px;
                width: @size;
                height: @size;
                margin-left: -@size/2;
                margin-top: -@size/2;
                background-color: @baseColorActive;
            }
        }

        .show-unread {
            span {
                position: relative;
            }

            &.show-unread-true {
                span:after {
                    @size: 5px;
                    position: absolute;
                    content: ' ';
                    width: @size;
                    height: @size;
                    border-radius: 50%;
                    background-color: red;
                }
            }
        }
    }
</style>
