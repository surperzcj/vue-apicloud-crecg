<template>
    <div class="multi-selector" v-show="showSelector">
        <div class="backup" @click="hideSelector"></div>
        <div class="content animated" :class="showSelector?'bounceInUp':''">
            <div class="content-title">
                <span class="content-title-text" v-text="title"></span>
                <div class="btn-box">
                  <span class="content-title-left btn-img" @click="hideSelector">
                    <img src="../assets/images/Close.png" alt="">
                  </span>
                  <span class="content-title-right btn-img" @click="confirmSelect">
                    <img src="../assets/images/Check.png" alt="" srcset="">
                  </span>
                </div>
            </div>
            <ul class="content-list" :style="{'padding-bottom':`${paddingBottom}px`}">
                <li v-for="item in list" @click="clickItem(item)"
                    :class="getItemClass(item)">
                    <span class="left" v-if="item.left" v-text="item.left"></span>
                    <span class="text" v-text="item.text"></span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
  import {apiReady} from '../utils/ApiCloudUtils'

  export default {
    name: 'multi-selector',
    props: {
      list: {
        type: Array,
        default () {
          return []
        }
      },
      multiable: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default () {
          return ''
        }
      }
    },
    data () {
      return {
        showSelector: false,
        selectedItem: null,
        selectedItemsId: [],
        selectedItems: [],
        paddingBottom: 0
      }
    },
    watch: {
      list () {
        this.list.map(item => {
          if (item.status && item.status === 'selected') {
            this.clickItem(item)
          }
        })
      }
    },
    methods: {
      show () {
        this.showSelector = true
      },
      hideSelector () {
        this.showSelector = false
        this.$emit('btn-left-click', false)
      },
      getItemClass (item) {
        if (this.multiable) {
          return this.selectedItemsId.indexOf(item.id) === -1 ? '' : 'selected'
        } else {
          return this.selectedItem && this.selectedItem.id === item.id ? 'selected' : ''
        }
      },
      clickItem (item) {
        if (this.multiable) {
          let index = this.selectedItemsId.indexOf(item.id)
          if (this.selectedItemsId.indexOf(item.id) === -1) {
            this.selectedItemsId.push(item.id)
            this.selectedItems.push(item)
          } else {
            this.selectedItemsId.splice(index, 1)
            this.selectedItems.splice(index, 1)
          }
        } else {
          this.selectedItem = item
        }
      },
      confirmSelect () {
        this.showSelector = false
        if (!this.multiable) {
          this.$emit('input', this.selectedItem)
          this.$emit('btn-right-click', this.selectedItem)
        } else if (this.multiable) {
          this.$emit('input', this.selectedItems)
          this.$emit('btn-right-click', this.selectedItems)
        }
      }
    },
    async created () {
      await apiReady()
      this.paddingBottom = window.api.safeArea.bottom
    }
  }
</script>

<style scoped lang="less">
    html, body, #app {
        height: 100% !important;
    }

    .multi-selector {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999999999;
        background-color: rgba(0, 0, 0, 0.42);

        .backup {
            height: 60%;
        }

        .content {
            background-color: #fff;
            z-index: 9999;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            overflow: hidden;
            display: flex;
            flex-flow: column wrap;
            bottom: 0;
            height: 40%;

            .content-title {
                display: flex;
                display: -webkit-flex;
                line-height: 50px;
                height: 50px;
                width: 100%;
                color: #010101;
                text-align: center;
                font-size: 15px;
                position: relative;

                .content-title-text {
                    // flex: 1;
                    padding-left: 20px;
                    // font-weight: 900;
                    letter-spacing: 2px;
                    font-size: 20px;
                    color: #22242A;
                }
                
                .btn-box {
                  position: absolute;
                  right: 20px;
                }
                .btn-img {
                  line-height: 50px;
                  img {
                    width: 20px;
                    height: 20px;
                  }
                }

                .content-title-left {
                  display: inline-block;
                    width: 50px;
                    color: #7f7f7f;
                }

                .content-title-right {
                  display: inline-block;
                    width: 50px;
                    color: #4657c0;
                }
            }

            .content-list {
                flex: 1;
                /*padding-top: 17px;*/
                /*padding-bottom: 1px;*/
                list-style: none;
                overflow-y: auto;
                height: calc(100% - 50px);

                li {
                    position: relative;
                    display: flex;
                    display: -webkit-flex;
                    padding: 0 47px 0 22px;
                    line-height: 56px;

                    .left {
                        flex: 3;

                        & ~ .text {
                            padding: 0 5px;
                            text-align: left !important;
                        }
                    }

                    .text {
                        flex: 5;
                        text-align: left;
                        font-size: 14px;
                        color: #22242A;
                    }

                    &.selected {
                        color: rgb(63, 103, 233);

                        &:before {
                            position: absolute;
                            content: '';
                            top: 0;
                            right: 22px;
                            width: 25px;
                            height: 100%;
                            background: data-uri('image/png;base64', '../assets/images/icon-right.png') no-repeat center;
                            background-size: 25px auto;
                        }
                    }

                    &:after {
                        position: absolute;
                        content: '';
                        left: 22px;
                        right: 22px;
                        bottom: 0;
                        height: 1px;
                        background: #d4d4d3;
                        -webkit-transform: scaleY(0.5);
                        -moz-transform: scaleY(0.5);
                        -ms-transform: scaleY(0.5);
                        -o-transform: scaleY(0.5);
                        transform: scaleY(0.5);
                    }

                    &:active {
                        background: #d4d4d3;
                    }
                }
            }
        }
    }
</style>
