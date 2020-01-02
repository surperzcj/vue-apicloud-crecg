<template>
    <div id="app">
        <!-- <ProjectHeader :project="project"/> -->
        <ul class="project-records">
            <li v-for="(r,index) in records">
                <!-- <span v-text="index+1"></span> -->
                <div class="headerImg">
                  <img :src="r.avatarUrl" >
                </div>
                <div class="records-box_info">
                  <div class="records-box">
                    <div><font v-text="r.juname" style="font-size: 14px;color: #22242A;"></font></div>
                    <div><font v-text="formatDate(r.created,'yyyy-MM-dd hh:mm:ss')" style="font-size: 10px;color: #8D92A3; letter-spacing: 1px;"></font></div>
                  </div>
                  <div class="desc" v-text="formatContent(r)" style="font-size: 12px; color: #8D92A3;"></div>
                </div>
            </li>
        </ul>

    </div>
</template>

<script>
  import ProjectHeader from 'components/ProjectHeader'
  import {getPageParams} from '../../utils/ApiCloudUtils'
  import {formatDate} from '../../utils/CommonUtils'
  import {getProjectRecords} from '../../utils/DataUtils'

  export default {
    name: 'app',
    components: { ProjectHeader },
    data () {
      return {
        project: {},
        records: []
      }
    },
    async created () {
      let { project } = await getPageParams()
      this.project = project
      this.getData()
    },
    methods: {
      formatDate,
      async getData () {
        let { c, d } = await getProjectRecords(this.project.jpid)
        if (c !== 0) {
          return
        }

        let { project, records } = d
        this.project = project
        this.records = records
      },
      formatContent ({juname, contentBefore, contentAfter, fieldName}) {
        return `将${fieldName}由【${contentBefore}】改为【${contentAfter}】`
      }
    },
    watch: {
      records() {
        console.log(this.records)
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .project-records {
        margin-top: 12px;
        list-style: none;

        li {
            position: relative;
            padding: 22px 10px 23px 20px;
            .records-box {
              display: flex;
              justify-content: space-between;
            }
            .headerImg {
              display: inline-block;
              width: 48px;
              height: 48px;
              border-radius: 24px;
              overflow: hidden;
              img {
                width: 100%;
              }
            }

            .records-box_info {
              display: inline-block;
              width: 265px;
            }
            span {
                position: absolute;
                left: 20px;
                top: 22px;
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
                // margin-bottom: 10px;
                font-size: 13px;
                color: #7f7f7f;

                font {
                    margin-left: 13px;
                }

                &.desc {
                    padding-left: 14px;
                    line-height: 33px;
                    margin-bottom: 0;
                    // background-color: #f5f5f5;
                    -webkit-border-radius: 5px;
                    -moz-border-radius: 5px;
                    border-radius: 5px;
                }
            }

            // &:first-child:before,
            &:after {
                position: absolute;
                content: ' ';
                left: 87px;
                right: 22px;
                height: 1px;
                background-color: #eee;
                -webkit-transform: scaleY(0.5);
                -moz-transform: scaleY(0.5);
                -ms-transform: scaleY(0.5);
                -o-transform: scaleY(0.5);
                transform: scaleY(0.5);
                width: 260px;
            }

            &:first-child:before {
                top: 0;
            }

            &:after {
                bottom: 0;
            }
        }
    }
</style>
