<template>
    <ul class="projects-container">
        <li v-for="(row,rowIndex) in rows" @click="toProjectDetail(row)" class="btn-animation-ripple">
            <div class="btn-animation-ripple-content"></div>
            <div class="projects-img">
                <!-- 假数据 -->
                <img v-if="row.imgUrl != null" :src="row.imgUrl" alt="" srcset="">
                <img v-else src="../assets/images/1550230119(1).jpg" alt="" srcset="">
            </div>
            <div class="projects-name">
                {{row.pname}}
                <!-- <div :class="calcTagClass(row)" v-if="showTag"></div> -->
            </div>
            <div class="projects-content">
                <div class="care-about">
                    <span class="projects-date" v-text="formatDate(row.created*1000+row.createdMs)"></span>
                    <span class="care-about-content">
                        关注度：
                        <span class="icon-care" :class="`care-${row.care}`"></span>
                    </span>

                </div>
                <div style="padding: 5px 0; overflow:hidden;">
                    <div class="projects-content-item project-people_status">
                        负责人：
                        <font v-text="calcUserName(row)"></font>
                    </div>
                    <div class="projects-content-item project-people_status project-status">
                        当前状态：<font v-text="row.statusName"></font>
                    </div>
                    <div class="projects-content-item project-people_status" v-if="row.status !== 8">
                        合同金额：
                        <font v-text="row.contractMoney+'元'"></font>
                    </div>
                </div>
                <div class="projects-content_box">
                  <project-progress-percent class="projects-content-item projects-content-item-padding" title="回款进度" :percent="row.returnPercent"
                                          v-if="showIncomePercent && checkProjectTrackSucceed(row)" theme="red" changeColor="red"/>
                <project-progress-percent class="projects-content-item" title="实施程度" :percent="row.progressPercent"
                                          v-if="showProgressPercent && checkProjectTrackSucceed(row)" theme="blue" changeColor="blue"/>
                </div>
            </div>
        </li>
        <li class="no-data" v-if="rows.length===0">
          <div><img src="../assets/images/nocontent.png" alt="" srcset=""></div>
          <p>暂未负责项目</p>
        </li>
    </ul>
</template>

<script>
  import {formatDate} from '../utils/CommonUtils'
  import {openWindow} from '../utils/ApiCloudUtils'
  import ProjectProgressPercent from './ProjectProgressPercent'

  export default {
    name: 'ProjectItem',
    components: { ProjectProgressPercent },
    props: {
      rows: Array,
      showProgressPercent: {
        type: Boolean,
        default () {
          return false
        }
      },
      showIncomePercent: {
        type: Boolean,
        default () {
          return false
        }
      },
      showTag: {
        type: Boolean,
        default () {
          return false
        }
      }
    },
    // watch: {
    //   rows(){
    //   console.log(JSON.stringify(this.rows, null, 4))
    //   }
    // },
    data () {
      return {}
    },
    methods: {
      formatDate,
      toProjectDetail (project) {
        openWindow('project_detail.html', '项目详情', { project })
      },
      checkProjectTrackSucceed ({ status }) {
        return status === 8
      },
      calcUserName ({ userInchargeObject, status, userDevelopObject }) {
        if (status === 8) {
          return userInchargeObject && userInchargeObject.juname || '暂未指定'
        } else {
          return userDevelopObject && userDevelopObject.juname || '暂未指定'
        }
      },
      calcTagClass ({ created }) {
        const diff = (new Date().getTime() / 1000 - created) / 60 / 60 / 24
        const inLastSevenDay = diff <= 7, inLastThirtyDay = !inLastSevenDay && diff <= 30
        return {
          'project-tag-month': inLastThirtyDay,
          'project-tag-week': inLastSevenDay
        }
      }
    }
  }
</script>

<style scoped lang="less">
    @import "../assets/style.less";

    .projects-container {
        list-style: none;
        padding: 11px 20px;
        background: #FFFFFF;

        li {
            position: relative;
            margin-bottom: 20px;
            box-shadow: 0 5px 20px 0 rgba(0,0,0,0.05);
            background: #fff;
            border-radius: 10px;
            overflow: hidden;

            .projects-name {
                position: relative;
                padding: 10px 20px 0;
                // min-height: 40px;
                font-size: 14px;
                letter-spacing: 1px;
                line-height: 21px;
                font-weight: 900;
                word-break: break-all; /* 支持IE和chrome，FF不支持*/
                word-wrap: break-word; /* 以上三个浏览器均支持 */
                color: #22242A;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .projects-img {
                height: 160px;
                overflow: hidden;

                img {
                    width: 100%;
                    border-radius: 10px 10px 0 0;
                }
            }

            .project-tag-month,
            .project-tag-week {
                display: inline-block;
                float: right;
                height: 20px;
                width: 50px;
                margin-top: -3px;
                background-image: data-uri('image/png;base64', '../assets/images/icon-project-tag-week.png');
                background-repeat: no-repeat;
                background-position: center;
                background-size: 50px auto;
            }

            .project-tag-month {
                background-image: data-uri('image/png;base64', '../assets/images/icon-project-tag-month.png');
            }

            // &:before {
            //     position: absolute;
            //     content: ' ';
            //     left: 15px;
            //     top: 11px;
            //     width: 3px;
            //     height: 22px;
            //     background: rgb(63, 103, 233);
            //     -webkit-border-radius: 1.5px;
            //     -moz-border-radius: 1.5px;
            //     border-radius: 1.5px;
            // }

            /*&:after {*/
            /*position: absolute;*/
            /*content: '';*/
            /*left: 0;*/
            /*right: 0;*/
            /*bottom: 0;*/
            /*height: 1px;*/
            /*background-color: #d4d4d3;*/
            /*-webkit-transform: scaleY(0.5);*/
            /*-moz-transform: scaleY(0.5);*/
            /*-ms-transform: scaleY(0.5);*/
            /*-o-transform: scaleY(0.5);*/
            /*transform: scaleY(0.5);*/
            /*}*/

            &.no-data {
                line-height: 37px;
                font-size: 16px;
                text-align: center;
                color: #8D92A3;
                letter-spacing: 3px;
                box-shadow: 0 5px 20px 0 rgba(0,0,0,0.05);
                border-radius: 10px;
                padding-bottom: 20px;
                div {
                  width: 60%;
                  margin: 0 auto;
                  padding-top: 20px;
                  
                  img {
                    width: 100%;
                  }
                }

                &:after,
                &:before {
                    display: none;
                }
            }

            .projects-content {
                position: relative;
                overflow: hidden;

                padding: 0 20px 19px;

                .projects-content-item {
                    line-height: 20px;
                    font-size: 12px;
                    color: #080808;
                    width: 50%;
                    padding-right: 10px;
                }

                // .projects-content-item-padding {
                //   padding-right: 5px;
                // }

                .project-people_status {
                    float: left;
                    width: 50%;
                    font-size: 12px;
                    color: #8D92A3;

                    font {
                      font-size: 12px;
                      color: #22242A;
                    }
                }
            }

            .care-about {
                font-size: 12px;
                color: #8D92A3;

                .care-about-content {
                    position: relative;
                    padding-left: 10px;

                    .icon-care {
                        position: absolute;
                        width: 16px;
                        height: 16px;
                        background-repeat: no-repeat;
                        background-position: center;
                        background-size: 100%;
                    }

                    .care-1 {
                        background-image: data-uri('image/png;base64', '../assets/images/icon-care-a.png');
                    }

                    .care-2 {
                        background-image: data-uri('image/png;base64', '../assets/images/icon-care-b.png');
                    }

                    .care-3 {
                        background-image: data-uri('image/png;base64', '../assets/images/icon-care-c.png');
                    }
                }

                .projects-date {
                    position: relative;
                    float: left;

                    // &:after {
                    //     position: absolute;
                    //     content: '';
                    //     height: 100%;
                    //     width: 10px;
                    //     left: -12px;
                    //     top: -1px;
                    //     background-image: data-uri('image/png;base64', "../assets/images/icon-date.png");
                    //     background-repeat: no-repeat;
                    //     background-size: 9px;
                    //     background-position: center;
                    // }
                }
            }
        }
    }

    .projects-content_box {
      display: flex;
      justify-content: space-between;
    }
</style>
