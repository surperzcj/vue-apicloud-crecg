<template>
    <div id="app" class="layout-container">
        <JHeader :title='title' :show-back="showBack" v-on:btnLeftClick="closeWindow" :btn-right="btnRight"/>
        <div class="layout-content"></div>
    </div>
</template>

<script>
  import {
    closeWindow,
    getPageParams,
    openFrame,
    addEventListener,
    sendEvent,
    apiReady
  } from '../../utils/ApiCloudUtils'
  import JHeader from '../../components/JHeader'
  import {LAYOUT_HEADER_HEIGHT} from '../../ProjectContants'

  export default {
    name: 'layout',
    components: {
      JHeader
    },
    data () {
      return {
        showBack: false,
        title: '',
        btnRight: null,
        headerHeight: 64
      }
    },
    async created () {
      let params = await getPageParams()

      this.showBack = params.header.showBack
      this.title = params.header.text

      addEventListener('viewappear', () => {
        sendEvent('layout-windowViewAppear', { winName: window.api.winName })
      })

      addEventListener('layout-showBtnRight', value => {
        if (window.api.winName === value.winName) this.btnRight = value.btnRight
      })

      this.headerHeight = LAYOUT_HEADER_HEIGHT + window.api.safeArea.top
      openFrame(params.url, this.headerHeight, params.query)
    },
    methods: {
      closeWindow
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    html, body, #app {
        height: 100%;
    }
</style>
