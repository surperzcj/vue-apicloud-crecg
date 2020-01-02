<template>
    <div id="app">
        <div class="project-member-add">
            <div class="project-name">
                起始时间
                <p v-text="`${activity.startDate} - ${activity.endDate}`"></p>
            </div>
        </div>
        <div class="project-member-add">
            <div class="project-name">
                备注
                <p v-text="activity.reamrk"></p>
            </div>
        </div>
        <div style="height: 8px;background: #ececec"></div>
        <div class="project-member-add">
            <div class="project-name">
                参与人员（{{activity.members.length}}）
            </div>
            <ul class="register-members">
                <li v-for="member in activity.members">
                    <span class="person" v-text="member.typeName"></span>
                    <span class="name" v-text="member.juname"></span>
                    <span class="mobile" v-text="member.mobile"></span>
                </li>
            </ul>
        </div>
        <div style="height: 8px;background: #ececec"></div>
        <div class="project-member-add">
            <div class="project-name">
                项目支出
            </div>
            <div style="padding: 0 23px">
                <div class="project-static-title">
                    总计：<span class="money font-red" v-text="-activity.money"></span>元
                    <span style="float: right;">
                        共<span class="size font-red" v-text="activity.fees.length"></span>笔
                    </span>
                </div>
            </div>
        </div>
        <ul class="project-activity-items">
            <li v-for="(fee,index) in activity.fees" @click="toDetail(fee)">
                <span v-text="index+1"></span>
                <div>报销金额：<font v-text="-fee.money" style="color: #3f67e9"></font></div>
                <div>报销内容：</div>
                <div class="desc">
                    <div v-text="fee.pafname"></div>
                </div>
            </li>
        </ul>
        <div style="height: 50px;"></div>
        <div class="project-bottom-add" v-if="project.canEdit" @click="add">添加活动</div>
    </div>
</template>

<script>
  import {
    getPageParams,
    sendEvent,
    confirm,
    addEventListener,
    toast,
    closeWindow,
    openWindow
  } from "../../utils/ApiCloudUtils";
  import {removeProjectActivity} from "../../utils/DataUtils";

  export default {
    name: 'app',
    data() {
      return {
        project: {},
        activity: {
          fees: [],
          members: []
        }
      }
    },
    async created() {
      let {project, activity} = await getPageParams();
      this.project = project;
      this.activity = activity;
      sendEvent('layout-showRemoveIcon', {
        winName: window.api.winName,
        show: project.canEdit
      });
      addEventListener('layout-showRemoveIcon-click', ({winName}) => {
        if (winName === window.api.winName) {
          this.removeActivity();
        }
      });
    },
    methods: {
      add() {
        openWindow('project_activity_add.html', '添加活动', {project: this.project});
      },
      async removeActivity() {
        if (!await confirm('确认删除项目')) {
          return;
        }

        let {c, m} = await removeProjectActivity(this.project.jpid, this.activity.paid);
        if (c !== 0) {
          return;
        }

        toast(m);
        setTimeout(closeWindow, 300);
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .font-red {
        color: rgb(247, 104, 104) !important;
        &.size {
            margin-left: 0;
            padding: 0 3px;
        }
    }

    .project-member-add {
        padding: 0 10px;

        .project-name {
            position: relative;
            padding-left: 26px;
            padding-top: 20px;
            padding-bottom: 5px;
            font-size: 15px;
            letter-spacing: 1px;
            line-height: 24px;
            font-weight: 900;
            background-color: #fff;

            &:before {
                position: absolute;
                content: ' ';
                left: 11px;
                top: 20.5px;
                width: 5.5px;
                height: 22px;
                background: @baseColor;
                -webkit-border-radius: 3.8px;
                -moz-border-radius: 3.8px;
                border-radius: 3.8px;
            }
        }
    }

    .project-add-form {
        margin-top: 44px;
        padding-bottom: 0;
    }

    .project-activity-members {
        list-style: none;
    }

    .project-activity-items {
        margin-top: 12px;
        list-style: none;

        li {
            position: relative;
            padding-top: 22px;
            padding-right: 22px;
            padding-left: 50px;
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

            & > div {
                margin-bottom: 10px;
                font-size: 13px;
                color: #7f7f7f;
                font {
                    float: right;
                    text-align: right;
                }

                &.desc {
                    padding-right: 47px;
                    & > div {
                        padding-left: 14px;
                        height: 33px;
                        line-height: 33px;
                        margin-bottom: 0;
                        background-color: #f5f5f5;
                        -webkit-border-radius: 5px;
                        -moz-border-radius: 5px;
                        border-radius: 5px;
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
        }
    }

    .project-activity-items.title {
        li {
            padding: 22px;
        }
    }

    .register-members li {
        padding: 0 13px;
    }
</style>
