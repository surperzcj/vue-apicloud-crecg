<template>
    <div class="c-header" :class="{'c-header-newBg': newBg}" :style="{'padding-top': `${paddingTop}px`}">
        <div class="c-header-left c-header-back" v-if="showBack" @click="btnLeftClick"></div>
        <div class="c-header-left c-header-search" v-if="showSearch" @click="btnLeftClick"></div>
        <div class="c-header-content" 
        v-html="titlePrefix + (title || '&nbsp;')" 
        :style="{'text-align': isMove ? 'left' : 'center', 'padding-left': isMove ? '15px' : '0', 'font-size': isMove ? '20px': ''}" 
        :class="{'chat-avatar': !!titlePrefix}"
        ></div>
        <div class="c-header-right c-header-text" :style="btnRight.style" v-if="btnRight" v-text="btnRight.text"
             @click="btnRightClick"></div>
        
        <div class="c-header-right c-linkman" v-if="showLinkman" @click="linkmanClick"></div>
        <div class="c-header-right c-location" v-if="showLocation" @click="locationClick"></div>
        <div class="c-header-right c-remove-project" v-if="showRemoveIcon" @click="removeIconClick"></div>
    </div>
</template>

<script>
  import {sendEvent, addEventListener, openWindow, apiReady, getPageParams} from '../utils/ApiCloudUtils'

  export default {
    name: 'jheader',
    props: ['title', 'showBack', 'showSearch', 'btnRight', 'showLocation', 'showLinkman', 'newBg', 'isMove'],
    data () {
      return {
        showRemoveIcon: false,
        paddingTop: 20,
        titlePrefix: ''
      }
    },
    async created () {
      this.checkShowRemoveIcon()
      await apiReady()
      this.paddingTop = window.api.safeArea.top

      getPageParams().then(params => {
        if (params.query && params.query.showAvatar && params.query.showAvatar.url) {
          this.titlePrefix = `<img src="${params.query.showAvatar.url}"/>`
        }
      })
    },
    methods: {
      btnRightClick () {
        this.$emit('btnRightClick')
        sendEvent('layout-btnRight-click', { winName: window.api.winName })
      },
      btnLeftClick () {
        this.$emit('btnLeftClick')
      },
      checkShowRemoveIcon () {
        addEventListener('layout-showRemoveIcon', value => {
          if (window.api.winName !== value.winName) {
            return
          }
          this.showRemoveIcon = value.show
        })
      },
      removeIconClick () {
        sendEvent('layout-showRemoveIcon-click', {
          winName: window.api.winName
        })
      },
      locationClick () {
        openWindow('project_location.html', '省份地图')
      },
      linkmanClick () {
        openWindow('register_users.html', '通讯录')
      }
    }
  }
</script>

<style lang="less">
    @import "../assets/style";

    .c-header {
        position: relative;
        line-height: @layoutHeight;
        background-color: #fff;
        // color: #444;
        text-align: center;
        padding-top: @headerPaddingTop;
        /*padding-left: 20px;*/
        font-size: 14px;
        color: #22242A;

        .c-header-content {
            position: relative;
        }

        .chat-avatar {
            padding-left: 60px;
            padding-right: 60px;
            text-align: left;
            line-height: 44px;
            img {
                vertical-align: -13px;
                margin-right: 10px;
                width: 36px;
                height: 36px;
                border-radius: 50%;
            }
        }
    }

    .c-header-newBg {
        color: #fff;

        .c-header-back:before {
            position: absolute;
            bottom: 50%;
            left: 50%;
            top: auto;
            width: @backSize;
            height: @backSize;
            margin-left: -@backSize/2px;
            margin-bottom: -@backSize/2px;
            border-left: 1px solid #fff;
            border-bottom: 1px solid #fff;
            -webkit-transform: rotate(45deg);
            transform: rotate(45deg);
            background: none;
        }
    }

    .c-header-left {
        position: absolute;
        bottom: 0;
        left: 0;
        height: @layoutHeight;
        width: @layoutHeight;
        z-index: 999;

        &:before {
            position: absolute;
            content: ' ';
            left: 50%;
            top: 50%;
        }
    }

    .c-header-back:before {
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-image: data-uri('image/png;base64', "../assets/images/icon-header-back.png");
        background-repeat: no-repeat;
        background-size: 16px;
        background-position: center;
    }

    .c-header-search {
        left: auto;
        right: 0;

        & ~ .c-header-text {
            right: @layoutHeight !important;
        }
    }

    .c-header-search:before {
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-image: data-uri('image/png;base64', "../assets/images/Search.png");
        background-size: 20px auto;
        background-repeat: no-repeat;
        background-position: center;
    }

    .c-header-right:active,
    .c-header-left:active {
        opacity: 0.7;
    }

    .c-header-right {
        position: absolute;
        bottom: 0;
        right: 0;
        height: @layoutHeight;
        width: @layoutHeight;
        line-height: @layoutHeight;
        font-size: 14px;

        &.c-remove-project {
            background-image: data-uri('image/png;base64', '../assets/images/Trash.png');
            background-size: 20px auto;
            background-repeat: no-repeat;
            background-position: center;
        }

        &.c-location {
            right: 44px !important;
            background-image: data-uri('image/png;base64', '../assets/images/Local.png');
            background-size: 20px auto;
            background-repeat: no-repeat;
            background-position: center;
        }
        &.c-linkman {
            // right: 44px !important;
            background-image: data-uri('image/png;base64', '../assets/images/linkman.png');
            background-size: 20px auto;
            background-repeat: no-repeat;
            background-position: center;
        }

        &.c-header-text ~ &.c-location {
            right: @layoutHeight*2 !important;
        }

    }
</style>
