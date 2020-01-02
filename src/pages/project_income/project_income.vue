<template>
    <div id="app">
        <ProjectHeader :project="project"/>
        <div class="project-income">
            <div class="project-income_title">
              <h2>进款状态</h2>
            </div>
            <div class="project-static-title">
                总计：
                <span class="money" v-text="incomeSum+'元'" style="padding-left: 20px; padding-right: 25px;"></span>
                笔数：
                <span class="size" v-text="incomes.length+'笔'" style="padding: 0 0 0 20px; margin-left: 0;"></span>
                
            </div>
            <div class="project-income_title">
              <h2>进款记录</h2>
            </div>
            <ul class="project-income-items">
                <li v-for="(income,index) in incomes">
                    <div class="project-income_box">
                      <div class="project-income-item project-income_time">
                          <!-- <span>进款时间</span> -->
                          <font v-text="formatDate(income.created)"></font>
                      </div>
                      <div class="project-income-item project-income_money">
                          <!-- <span>进款金额</span> -->
                          <font v-text="income.money+'元'" ></font>
                      </div>
                    </div>
                    <!-- <div class="project-income-item">
                        <span>进款时间</span>
                        <font v-text="formatDate(income.created)"></font>
                    </div>
                    <div class="project-income-item">
                        <span>添加人</span>
                        <font v-text="income.juname"></font>
                    </div>
                    <div class="project-income-item">
                        <span>进款金额</span>
                        <font v-text="income.money+'元'"></font>
                    </div> -->
                    <div class="project-income-item">
                        <!-- <span>添加人</span> -->
                        <font class="project-income_people" v-text="'添加人：'+income.juname"></font>
                    </div>
                    <div class="project-icon-remove" v-if="canRemove" @click="remove(income, index)">
                        <b></b>
                        <b></b>
                        <b></b>
                    </div>
                </li>
            </ul>
        </div>
        <div class="project-bottom-add income weui-flex"
             :style="{'height':`${footerHeight}px`, 'line-height':`${footerHeight}px`}"
             v-if="canCreate || canClear">
            <div class="weui-flex__item add" v-if="canCreate" @click="add">添加进款</div>
            <div class="weui-flex__item clear" v-if="canClear" @click="clear">款清</div>
        </div>
    </div>
</template>

<script>
  import ProjectHeader from '../../components/ProjectHeader.vue'
  import {getPageParams, addEventListener, toast, openWindow, confirm} from '../../utils/ApiCloudUtils'
  import {getProjectIncomes, projectContractMoneyClear, removeProjectIncome} from '../../utils/DataUtils'
  import {formatDate} from '../../utils/CommonUtils'

  export default {
    name: 'app',
    components: { ProjectHeader },
    data () {
      return {
        project: {},
        incomes: [],
        buttons: [],
        paddingBottom: 0
      }
    },
    computed: {
      footerHeight () {
        return this.paddingBottom + 40
      },
      canRemove () {
        return this.buttons.includes('remove-income') && !this.project.clearMoney
      },
      canCreate () {
        return this.buttons.includes('create-income') && !this.project.clearMoney
      },
      canClear () {
        return this.buttons.includes('money-clear') && !this.project.clearMoney
      },
      incomeSum () {
        return '+' + this.incomes.reduce((sum, income) => {
          return sum + parseFloat(income.money)
        }, 0).toFixed(2)
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
      formatDate,
      async getData () {
        let { c, d } = await getProjectIncomes(this.project.jpid)
        if (c !== 0) {
          return
        }

        let { project, incomes, buttons } = d
        this.project = project
        this.incomes = incomes
        this.buttons = buttons
      },
      async remove (income, index) {
        if (!await confirm(`确认删除?`)) {
          return
        }

        let { c, m } = await removeProjectIncome(this.project.jpid, income.piid)
        if (c !== 0) {
          return
        }

        toast(m)
        this.incomes.splice(index, 1)
      },
      add () {
        openWindow('project_income_add.html', '添加项目进款', { project: this.project })
      },
      async clear () {
        // let msg = `本项目合同金额为${this.project.contractMoney}, 总进款为${this.incomeSum}`
        if (!await confirm('确认之后将不可再添加进款', '确认标记本项目为已款清？')) {
          return
        }

        let { c, m } = await projectContractMoneyClear(this.project.jpid)
        if (c === 0) {
          toast(m)
          this.project.clearMoney = true
        }
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .project-bottom-add.income {
      background-color: #fff;
      bottom: 20px;
      padding: 0 20px;
        .add {
            background-color: #6478D3;
            width: 210px;
            height: 46px;
            border-radius: 23px;

            &:active {
                background-color: #fff
            }
        }

        .clear {
            background-color: #EF4B5F;
            width: 210px;
            height: 46px;
            border-radius: 23px;
            margin-left: 20px;

            &:active {
                background-color: #d62525;
            }
        }
    }

    .project-static-title {
      // margin-bottom: 20px;
      padding-bottom: 40px;
      font-size: 14px;
      color: #8D92A3;
    }

    .project-income {
        padding: 0 22px 40px;
        margin-top: 40px;

        .project-income_title {
          padding-bottom: 20px;
          h2 {
            font-size: 20px;
            color: #22242A;
            font-weight: normal;
          }
        }

        .project-income-items {
            list-style: none;
            padding: 0 0 40px 0;

            li {
                position: relative;
                margin-bottom: 20px;
                // display: flex;
                // display: -webkit-flex;

                .project-income_box {
                  display: flex;
                  justify-content: space-between;
                }
                .project-income_people {
                  text-align: left;
                  font-size: 12px;
                  color: #8D92A3 !important;
                }
                .project-income-item {
                    // flex: 1;
                    text-align: center;
                    font-size: 13px;

                    span {
                        padding-top: 15px;
                        padding-bottom: 28px;
                        color: #7f7f7f;
                    }

                    font {
                        padding-bottom: 22px;
                        color: #22242A;
                        font-size: 14px;
                    }

                    span, font {
                        display: block;
                    }
                }

                &:first-child:after,
                &:after {
                    position: absolute;
                    content: ' ';
                    left: 0;
                    right: 0;
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

                .project-icon-remove {
                  bottom: 23px;
                }
            }
        }

    }
</style>
