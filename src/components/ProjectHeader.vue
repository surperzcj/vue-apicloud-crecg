<template>
    <div class="project-header">
        <div>
            <div class="project-img">
              <img v-if="project.imgUrl != null" :src="project.imgUrl" alt="" srcset="">
              <img v-else src="../assets/images/1550230119(1).jpg" alt="" srcset="">
            </div>
            <div class="project-name">
                <div class="project-name-content" v-text="project.pname"></div>
            </div>
            <div class="project-content">
                <div class="project-content-person">
                  负责人：
                  <font>{{inchargeUserName}}</font>
                </div>
                <div class="project-content-trun">
                  项目移交：
                  <font>{{turnStatusName}}</font>
                </div>
            </div>
            <div class="project-content">
                <div class="project-content-source-type">
                  项目来源：
                  <font>{{project.sourceTypeName||''}}</font>
                </div>
                <div class="project-content-date">
                  创建时间：
                  <font>{{createdDate}}</font>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  import {formatDate} from '../utils/CommonUtils'

  export default {
    name: "project-header",
    props: {
      project: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    computed: {
      turnStatusName() {
        return this.project.chiefEngineer ? '已移交' : '未移交'
      },
      inchargeUserName() {
        if (this.project.status === 8){
          return this.project.userInchargeObject && this.project.userInchargeObject.juname || '未指定负责人'
        } else {
          return this.project.userDevelopObject && this.project.userDevelopObject.juname || '未指定负责人'
        }
      },
      createdDate() {
        let {created = null, createdMs = null} = this.project;
        return created ? formatDate(created * 1000 + createdMs, 'yyyy-MM-dd') : '';
      }
    }
  }
</script>

<style lang="less">
    @import "../assets/style";

    .project-header {
        padding: 11px 14px;
        & > div {
            padding-bottom: 14px;
            box-shadow: 0 5px 20px 0 rgba(0,0,0,0.05);
            border-radius: 10px;
        }

        .project-img {
          padding: 0 6px;
          height: 160px;
          border-radius: 10px;
          img {
            width: 100%;
            height: 100%;
            border-radius: 10px;
          }
        }
        .project-name {
            position: relative;
            padding-left: 6px;
            padding-top: 20px;
            padding-right: 6px;
            margin-bottom: 17px;
            letter-spacing: 1px;
            line-height: 24px;
            font-weight: 600;
            font-size: 14px;
            color: #22242A;
            // &:before {
            //     position: absolute;
            //     content: ' ';
            //     left: 11px;
            //     top: 20.5px;
            //     width: 5.5px;
            //     height: 22px;
            //     background: rgb(63, 103, 233);
            //     -webkit-border-radius: 3.8px;
            //     -moz-border-radius: 3.8px;
            //     border-radius: 3.8px;
            // }
        }
        .project-content {
            display: flex;
            display: -webkit-flex;
            & > div {
                position: relative;
                padding-left: 6px;
                flex: 1;
                font-size: 12px;
                color: #8D92A3;
                font {
                  font-size: 12px;
                  color: #22242A;
                }

                &:before {
                    position: absolute;
                    content: ' ';
                    left: 10px;
                    top: 50%;
                    margin-top: -6.5px;
                    width: 13px;
                    height: 13px;
                    background-size: auto 13px;
                    background-position: center;
                    background-repeat: no-repeat;
                }
            }

            // .project-content-person:before {
            //     // background-image: data-uri('image/png;base64', '../assets/images/icon-incharge-person.png');
            //   content: '负责人'
            // }

            // .project-content-trun:before {
            //     background-image: data-uri('image/png;base64', '../assets/images/icon-projdetail-turn.png');
            // }

            // .project-content-date:before {
            //     background-image: data-uri('image/png;base64', '../assets/images/icon-incharge-date.png');
            // }

            // .project-content-source-type:before {
            //     background-image: data-uri('image/png;base64', '../assets/images/icon-projdetail-sourcetype.png');
            // }
        }
    }
</style>
