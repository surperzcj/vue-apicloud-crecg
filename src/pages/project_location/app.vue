<template>
    <div id="app">
        <div class="project-location-bottom" :style="{'bottom':`${paddingBottom+3}px`}" v-text="showText"
             @click="openProjects"></div>
    </div>
</template>

<script>
  import {apiReady, openWindow} from '../../utils/ApiCloudUtils'
  import BMap from '../../utils/BMap'
  import {getPositionByCode} from '../../utils/regions'
  import {getAreaProjectCounts} from '../../utils/DataUtils'

  export default {
    name: 'app',
    data () {
      return {
        counts: [],
        map: null,
        showText: '点击城市查看',
        count: null,
        paddingBottom: 0
      }
    },
    async created () {
      this.getData()
      await apiReady()
      this.paddingBottom = window.api.safeArea.bottom
    },
    methods: {
      clickCity (code) {
        this.count = this.getCountByCode(code)
        this.showText = `${this.count.sum}个项目`
      },
      getCountByCode (code) {
        for (let i = 0; i < this.counts.length; i++) {
          if (this.counts[i].area == code) {
            return this.counts[i]
          }
        }
      },
      async getData () {
        let { c, d } = await getAreaProjectCounts()
        if (c !== 0) {
          return
        }

        let { counts } = d
        this.counts = counts
        this.openMap()
      },
      async openMap () {
        if (!this.map) {
          await apiReady()
          this.map = new BMap(window.api.require('bMap'))
        }
        await this.map.init()
        await this.map.openMap()

        let annotations = this.counts.filter(({ area }) => Boolean(area)).map(count => {
          let { area } = count

          let province = getPositionByCode(area)
          console.log('getPositionByCode', area, province)
          if (!province) return null
          let { latitude, longitude, name } = province
          count.name = name
          return {
            id: area,
            lon: longitude,
            lat: latitude
          }
        }).filter(item => item !== null)
        this.map.addAnnotations(annotations, code => {
          this.clickCity(code)
        })
      },
      openProjects () {
        if (this.count == null) {
          return
        }

        openWindow('projects.html', `${this.count.name}项目列表`, {
          hideSubtitle: true,
          area: this.count.area
        })
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    #app, html, body {
        height: 100%;
    }

    .project-location-bottom {
        position: fixed;
        bottom: 2px;
        left: 50%;
        margin-left: -100px;
        width: 200px;
        text-align: center;
        line-height: 43px;
        font-size: 16px;
        letter-spacing: 1px;
        background-color: #ffc857;
        color: #ffffff;
        z-index: 999;
        border-radius: 22px;

        &:active {
            background-color: #dba94d;
        }

        &:after {
            position: absolute;
            content: ' ';
            right: 20px;
            top: 16px;
            width: 10px;
            height: 10px;
            border-right: 1px solid #fff;
            border-bottom: 1px solid #fff;
            -webkit-transform: rotate(-45deg);
            -moz-transform: rotate(-45deg);
            -ms-transform: rotate(-45deg);
            -o-transform: rotate(-45deg);
            transform: rotate(-45deg);
        }

    }
</style>
