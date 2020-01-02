<template>
    <div id="app">
        <ProjectHeader :project="project"/>
        <div class="project-activity">
            <div class="project-activity-title">
                总计：
                <span class="money" v-text="project.spendSum"></span>
                元
                <span class="size" v-text="activities.length"></span>
                次活动
            </div>
        </div>
        <ul class="project-activity-items">
            <li v-for="activity in activities" @click="toDetail(activity)">
                <span>1</span>
                <div>项目总支出：<font v-text="'-'+ activity.money" style="color: #f76868;"></font></div>
                <div>参与人员：<font v-text="activity.memberThumb"></font></div>
                <div class="desc" v-text="activity.reamrk"></div>
            </li>
        </ul>

        <div class="project-bottom-add" v-if="project.canEdit" @click="add">添加活动</div>
    </div>
</template>

<script>
  import ProjectHeader from '../../components/ProjectHeader.vue'
  import {getPageParams, openWindow, addEventListener} from "../../utils/ApiCloudUtils";
  import {getProjectActivities} from "../../utils/DataUtils";

  export default {
    name: 'app',
    components: {ProjectHeader},
    data() {
      return {
        project: {},
        activities: [],
      }
    },
    async created() {
      let {project} = await getPageParams();
      this.project = project;
      this.getData();

      addEventListener('layout-windowViewAppear', ({winName}) => {
        if (winName !== window.api.winName) {
          return;
        }
        this.getData();
      });
    },
    methods: {
      async getData() {
        let {c, d} = await getProjectActivities(this.project.jpid);
        if (c !== 0) {
          return;
        }
        let {project, activities} = d;

        this.project = project;
        this.activities = activities;
      },

      toDetail(activity) {
        openWindow('project_activity_detail.html', '活动详情', {
          project: this.project,
          activity
        });
      },
      add() {
        openWindow('project_activity_add.html', '添加活动', {project: this.project});
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .project-activity {
        padding: 0 22px;
        margin-top: 45px;

        .project-activity-title {
            position: relative;
            padding-left: 20px;
            font-size: 13px;
            font-weight: 900;

            &:before {
                position: absolute;
                content: ' ';
                left: 0;
                top: 50%;
                margin-top: -7.5px;
                width: 15px;
                height: 15px;
                background-image: data-uri('image/png;base64', '../../assets/images/icon-income.png');
                background-size: 15px;
                background-position: center;
                background-repeat: no-repeat;
            }
            .money,
            .size {
                color: rgb(247, 104, 104);
                font-size: 14px;
            }
            .size {
                margin-left: 15px;
            }
        }
    }

    .project-activity-items {
        margin-top: 12px;
        list-style: none;

        li {
            position: relative;
            padding-top: 22px;
            padding-left: 50px;
            padding-right: 69px;
            padding-bottom: 23px;

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
                background: @baseColor;
            }

            div {
                margin-bottom: 10px;
                font-size: 13px;
                color: #7f7f7f;
                font {
                    margin-left: 13px;
                }

                &.desc {
                    padding-left: 14px;
                    height: 33px;
                    line-height: 33px;
                    margin-bottom: 0;
                    background-color: #f5f5f5;
                    -webkit-border-radius: 5px;
                    -moz-border-radius: 5px;
                    border-radius: 5px;

                    &:after {
                        position: absolute;
                        right: 22px;
                        top: 32px;
                        content: ' ';
                        width: 11px;
                        height: 11px;
                        border-right: 2px solid #949496;
                        border-bottom: 2px solid #949496;
                        -webkit-transform: rotate(-45deg);
                        -moz-transform: rotate(-45deg);
                        -ms-transform: rotate(-45deg);
                        -o-transform: rotate(-45deg);
                        transform: rotate(-45deg);
                    }
                }
            }

            &:first-child:before,
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
</style>
