<template>
    <div class="area-selector" v-show="showSelector" :class="showSelector?'bounceInUp':''">
        <div class="backup" @click="quitSelect"></div>
        <div class="content">
            <div class="content-title">
                选择地区
                <span @click="quitSelect">X</span>
            </div>
            <div class="content-subtitle">已选择</div>
            <div class="content-text">
                <span v-text="selectedProvince&&selectedProvince.region || '请选择'"
                      :class="selectedProvince?'':'unselect'" @click="reset"></span>
                <span class="unselect" v-if="selectedProvince">请选择</span>
            </div>
            <div class="content-select-title" v-text="!selectedProvince?'选择省份':'选择城市'"></div>
            <div class="content-areas-container">
                <ul class="content-areas" v-if="selectedProvince==null">
                    <li v-for="province in regions" v-text="province.region"
                        @click="selectProvinceFinished(province)"></li>
                </ul>
                <ul class="content-areas" v-if="selectedProvince!=null">
                    <li v-for="city in regionEntitys" v-text="city.region"
                        @click="selectCity(city)"></li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
  import {regions} from '../utils/regions'

  export default {
    props: ['showSelector'],
    data () {
      return {
        regions,
        selectedProvince: null,
        regionEntitys: [],
        selectedCity: null
      }
    },
    methods: {
      reset () {
        this.selectedProvince = null
        this.selectedCity = null
      },
      quitSelect () {
        this.$emit('areaSelectorQuit')
        this.reset()
      },
      selectCity (city) {
        let data = Object.assign({}, city)
        data.region = this.selectedProvince.region + '/' + data.region
        this.$emit('areaSelectorSelected', data)
        this.quitSelect()
      },
      selectProvinceFinished (province) {
        this.selectedProvince = province
        if (['110000', '120000', '500000'].includes(province.code)) {
          this.regionEntitys = province.regionEntitys[0].regionEntitys
        } else {
          this.regionEntitys = province.regionEntitys
        }
      }
    }
  }
</script>

<style lang="less" scoped>
    .area-selector {
        .backup {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #000;
            opacity: 0.41;
            z-index: 999;
        }

        .content {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            height: 66.7%;
            background-color: #fff;
            z-index: 9999;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            overflow: hidden;

            & > div {
                background-color: #fff;
                z-index: 9;
            }

            .content-title {
                position: relative;
                text-align: center;
                line-height: 40px;
                font-size: 15px;
                color: #010101;

                span {
                    float: right;
                    width: 40px;
                }
            }

            .content-subtitle {
                padding: 0 22px;
                color: #7f7f7f;
                font-size: 13px;
            }

            .content-text {
                padding: 0 12px;
                margin-top: 10px;
                line-height: 43px;
                background-color: #edecec;

                span {
                    padding: 0 20px;
                    text-align: center;
                    font-size: 15px;
                    color: #000;

                    &.unselect {
                        position: relative;
                        color: #3f67e9;

                        &:after {
                            position: absolute;
                            content: '';
                            left: 50%;
                            bottom: -6px;
                            margin-left: -13px;
                            width: 26px;
                            height: 3px;
                            background-color: #3f67e9;
                            -webkit-border-radius: 3px;
                            -moz-border-radius: 3px;
                            border-radius: 3px;
                        }
                    }
                }
            }

            .content-select-title {
                padding: 22px 22px 0;
                color: #7f7f7f;
                font-size: 13px;
            }

            .content-areas-container {
                position: absolute;
                top: 155px;
                bottom: 0;
                left: 0;
                width: 100%;
                overflow: scroll;
                z-index: 0;
            }

            .content-areas {
                list-style: none;
                overflow-y: auto;

                li {
                    padding-left: 43px;
                    line-height: 44px;
                    font-size: 15px;
                    color: #000;
                }
            }
        }
    }
</style>
