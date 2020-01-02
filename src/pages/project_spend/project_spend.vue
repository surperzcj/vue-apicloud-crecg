<template>
    <div id="app">
        <ProjectHeader :project="project"/>
        <div class="project-spend">
            <div class="project-spend-title">
                总计：
                <span class="money" v-text="'-'+project.spendSum"></span>
                元
            </div>
        </div>
        <ul class="project-spend-items">
            <li v-for="spend in spends">
                <div>支出类型：<b v-text="spend.typeName"></b></div>
                <div>记录人：<b v-text="spend.juname"></b></div>
                <span v-text="'-'+spend.money"></span>
                <div class="project-icon-remove" v-if="project.canEdit && buttons.includes('remove-spend')" @click="remove(spend)">
                    <b></b>
                    <b></b>
                    <b></b>
                </div>
            </li>
        </ul>

        <div class="project-bottom-add" 
             v-if="project.canEdit && buttons.includes('create-spend')" @click="add">添加支出
        </div>
    </div>
</template>

<script>
  import ProjectHeader from '../../components/ProjectHeader'
  import {getPageParams, openWindow, addEventListener, toast, confirm} from '../../utils/ApiCloudUtils'
  import {getProjectSpends, removeProjectSpend} from '../../utils/DataUtils'

  export default {
    name: 'app',
    components: { ProjectHeader },
    data () {
      return {
        project: {},
        spends: [],
        buttons: [],
        paddingBottom: 0
      }
    },
    computed: {
      footerHeight () {
        return this.paddingBottom + 40
      }
    },
    async created () {
      let { project } = await getPageParams()
      this.project = project
      this.getData()
      this.paddingBottom = window.api.safeArea.bottom

      addEventListener('layout-windowViewAppear', ({ winName }) => {
        if (winName !== window.api.winName) {
          return
        }
        this.getData()
      })
    },
    methods: {
      async remove (spend) {
        if (!await confirm('确认删除？')) {
          return
        }
        let { c, m } = await removeProjectSpend(this.project.jpid, spend.psid)
        if (c !== 0) {
          return
        }
        toast(m)
        this.getData()
      },
      add () {
        openWindow('project_spend_add.html', '添加项目支出', { project: this.project })
      },
      async getData () {
        let { c, d } = await getProjectSpends(this.project.jpid)
        if (c !== 0) {
          return
        }

        let { spends, project, buttons } = d
        this.spends = spends
        this.project = project
        this.buttons = buttons
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .project-spend {
        padding: 0 22px;
        margin-top: 45px;

        .project-spend-title {
            position: relative;
            font-size: 13px;
            font-weight: 900;

            // &:before {
            //     position: absolute;
            //     content: ' ';
            //     left: 0;
            //     top: 50%;
            //     margin-top: -7.5px;
            //     width: 15px;
            //     height: 15px;
            //     background-image: data-uri('image/png;base64', '../../assets/images/icon-income.png');
            //     background-size: 15px;
            //     background-position: center;
            //     background-repeat: no-repeat;
            // }

            .money {
                color: rgb(247, 104, 104);
                font-size: 14px;
            }
        }
    }

    .project-spend-items {
        padding: 0 22px;
        margin-top: 12px;
        list-style: none;

        li {
            position: relative;
            padding: 8px 0 20px 0;

            & > div {
                line-height: 28px;
                font-size: 13px;
                color: #7f7f7f;

                & > b {
                    color: #000;
                    font-weight: normal;
                }
            }

            & > span {
                position: absolute;
                right: 0;
                top: 28px;
                font-size: 13px;
                color: #f76868;
            }

            .project-icon-remove {
                right: 0 !important;
            }

            &:first-child:before,
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
        }
    }
    .project-bottom-add {
      height: 46px !important;
      border-radius: 46px !important;
    }
</style>
