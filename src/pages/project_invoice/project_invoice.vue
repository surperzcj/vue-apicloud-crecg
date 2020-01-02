<template>
    <div id="app">
        <!-- <ProjectHeader :project="project"/> -->
        <div class="project-invoice">
            <div class="invoice-status">
              <h2>开票状态</h2>
            </div>
            <div class="project-static-title">
                总计：
                <span class="money" v-text="invoiceSum+'元'" style="color: #22242A;"></span>
                张数
                <span class="size" v-text="invoices.length+'张'" style="color: #22242A;"></span>
                
            </div>
        </div>
        <div class="invoice-record">
          <h2>记录</h2>
        </div>
        <ul class="project-invoice-items">
            <li v-for="(invoice,index) in invoices" @click="toDetail(invoice)">
                <!-- <span v-text="index+1"></span> -->
                <div class="money-box">
                  <div><font v-text="invoice.date"></font></div>
                  <div><font v-text="invoice.money + '元'"></font></div>
                </div>
                <p>添加人：{{ invoice.juname }}</p>
                <div class="desc">
                  {{ '备注：'+invoice.content}}
                  <div class="desc-pic">
                    <img src="../../assets/images/Edit.png" alt="">
                  </div>
                </div>
            </li>
        </ul>

        <div class="project-bottom-add" :style="{'height':`${footerHeight}px`, 'line-height':`${footerHeight}px`}"
             v-if="project.canEdit && buttons.includes('create-invoice')" @click="add">添加发票
        </div>
    </div>
</template>

<script>
  import ProjectHeader from '../../components/ProjectHeader.vue'
  import {getPageParams, openWindow, addEventListener} from '../../utils/ApiCloudUtils'
  import {getProjectInvoices} from '../../utils/DataUtils'

  export default {
    name: 'app',
    components: { ProjectHeader },
    data () {
      return {
        project: {},
        invoices: [],
        buttons: [],
        paddingBottom: 0,
        get invoiceSum () {
          return '-' + this.invoices.reduce((sum, invoice) => {
            return sum + parseFloat(invoice.money)
          }, 0).toFixed(2)
        }
      }
    },
    computed: {
      footerHeight () {
        return this.paddingBottom + 40
      }
    },
    async created () {
      addEventListener('layout-windowViewAppear', ({ winName }) => {
        if (winName !== window.api.winName) {
          return
        }
        this.getData()
      })

      let { project } = await getPageParams()
      this.project = project
      this.getData()
      this.paddingBottom = window.api.safeArea.bottom
    },
    methods: {
      async getData () {
        let { c, d } = await getProjectInvoices(this.project.jpid)
        if (c !== 0) {
          return
        }

        let { project, invoices, buttons } = d
        this.project = project
        this.invoices = invoices
        console.log(this.invoices)
        this.buttons = buttons
      },
      add () {
        openWindow('project_invoice_add.html', '添加项目发票', { project: this.project })
      },
      toDetail (invoice) {
        openWindow('project_invoice_detail.html', '发票详情', {
          project: this.project,
          invoice,
          canRemove: this.project.canEdit && this.buttons.includes('remove-invoice')
        })
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .project-invoice {
        padding: 0 22px;
        margin-top: 45px;
    }

    .project-invoice-items {
        margin-top: 12px;
        list-style: none;
        padding-bottom: 40px;

        li {
            position: relative;
            padding-top: 22px;
            padding-left: 22px;
            padding-right: 22px;
            padding-bottom: 23px;
            
            .money-box {
              display: flex;
              justify-content: space-between;
            }

            p {
              font-size: 12px;
              color: #8D92A3;
              line-height: 22px;
              padding-top: 1.5%;
              padding-bottom: 2%;
            }

            span {
                position: absolute;
                left: 20px;
                top: 18px;
                height: 20px;
                width: 20px;
                font-size: 12px;
                line-height: 20px;
                text-align: center;
                -webkit-border-radius: 50%;
                -moz-border-radius: 50%;
                border-radius: 50%;
                color: #fff;
                background: #6478D3;
            }

            div {
                // margin-bottom: 10px;
                font-size: 13px;
                color: #7f7f7f;

                font {
                    // margin-left: 13px;
                    font-size: 14px;
                    color: #22242A;
                }

                &.desc {
                    min-height: 68px !important;
                    padding: 12px 14px;
                    // line-height: 33px;
                    padding-right: 40px;
                    margin-bottom: 0;
                    background-color: #f5f5f5;
                    -webkit-border-radius: 5px;
                    -moz-border-radius: 5px;
                    border-radius: 5px;
                    box-sizing: border-box;
                    position: relative;

                    .desc-pic {
                      position: absolute;
                      right: 17px;
                      bottom: 15px;
                      width: 16px;
                      height: 16px;

                      img {
                        width: 100%;
                      }
                    }
                    // &:after {
                    //     position: absolute;
                    //     right: 22px;
                    //     top: 32px;
                    //     content: ' ';
                    //     width: 11px;
                    //     height: 11px;
                    //     border-right: 2px solid #949496;
                    //     border-bottom: 2px solid #949496;
                    //     -webkit-transform: rotate(-45deg);
                    //     -moz-transform: rotate(-45deg);
                    //     -ms-transform: rotate(-45deg);
                    //     -o-transform: rotate(-45deg);
                    //     transform: rotate(-45deg);
                    // }
                }
            }

            &:after {
                position: absolute;
                content: ' ';
                left: 22px;
                right: 22px;
                height: 1px;
                background-color: #eee;
                -webkit-transform: scaleY(0.5);
                -moz-transform: scaleY(0.5);
                -ms-transform: scaleY(0.5);
                -o-transform: scaleY(0.5);
                transform: scaleY(0.5);
            }

            &:first-child:before {
                top: 0;
            }

            &:after {
                bottom: 0;
            }

            &:active {
                background-color: #eee;
            }
        }
    }
    .invoice-record {
      padding: 0 22px;
    }
    .invoice-status, .invoice-record {
      font-size: 16px;
      color: #22242A;

      h2 {
        font-size: 20px;
        color: #22242A;
        font-weight: normal;
      }
    }
    .project-static-title {
      margin: 20px 0 40px;
      font-size: 14px !important;
      color: #8D92A3 !important;
      font-weight: 400 !important;
    }

    .project-bottom-add {
      margin-bottom: 5% !important; 
    }
</style>
