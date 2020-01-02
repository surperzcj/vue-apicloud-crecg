<template>
    <div class="project-progress-plantime-container">
        
        <ul class="plan-times">
            <li v-for="time in times">
                <progress-plan-time-input v-model="form[time.model]"
                                          :error="error[time.model]"
                                          :label="time.label"
                                          :placeholder="time.placeholder"/>
            </li>
        </ul>
        <div class="date-limit">
            [{{project.pname}}]约定工期为{{project.dateLimitText}}
        </div>
        <div class="weui-flex buttons">
            <div class="sure-add_btn" @click="confirm">
                <div class="btn-animation-ripple-content"></div>
                确认
            </div>
            <div class="cancle-add_btn" @click="cancel">
                <div class="btn-animation-ripple-content"></div>
                取消
            </div>
        </div>
    </div>
</template>

<script>
  import ProgressPlanTimeInput from '../../components/ProgressPlanTimeInput'
  import {closeWindow, getPageParams, toast} from "../../utils/ApiCloudUtils";
  import {formatDate, parseTimestamp} from "../../utils/CommonUtils";
  import {setProgressPlanTime} from "../../utils/DataUtils";

  export default {
    name: 'app',
    components: {ProgressPlanTimeInput},
    data() {
      return {
        project: {
          pname: null
        },
        progresses: [],
        times: [
          {model: 'progress_11', placeholder: '请选择方案计划完成时间', label: '方案时间'},
          {model: 'progress_13', placeholder: '请选择外业计划完成时间', label: '外业时间'},
          {model: 'progress_14', placeholder: '请选择内业计划完成时间', label: '内业时间'},
          {model: 'progress_15', placeholder: '请选择内审计划完成时间', label: '内审时间'},
          {model: 'progress_16', placeholder: '请选择资料提交计划时间', label: '资料提交时间'},
        ],
        form: {
          progress_11: null,
          progress_13: null,
          progress_14: null,
          progress_15: null,
          progress_16: null,
        },
        error: {
          progress_11: '',
          progress_13: '',
          progress_14: '',
          progress_15: '',
          progress_16: '',
        }
      }
    },
    async created() {
      let {project, progresses} = await getPageParams();
      this.project = project;
      this.progresses = progresses;
    },
    computed: {
      dateLimit() {
        return this.project.dateLimit * 1000
      },
      progress_11_ts() {
        return this.form.progress_11 ? parseTimestamp(this.form.progress_11) : null
      },
      progress_13_ts() {
        return this.form.progress_13 ? parseTimestamp(this.form.progress_13) : null
      },
      progress_14_ts() {
        return this.form.progress_14 ? parseTimestamp(this.form.progress_14) : null
      },
      progress_15_ts() {
        return this.form.progress_15 ? parseTimestamp(this.form.progress_15) : null
      },
      progress_16_ts() {
        return this.form.progress_16 ? parseTimestamp(this.form.progress_16) : null
      },
      planTimes() {
        return this.progresses.map(({progid: id, planTime}) => {
          return {id, planTime}
        })
      },
      hasErrors() {
        return Object.values(this.error).filter(error => error).length > 0;
      }
    },
    watch: {
      form: {
        deep: true,
        handler() {
          this.error.progress_11 = this.compareTime(null, this.progress_11_ts, null);
          this.error.progress_13 = this.compareTime(this.progress_11_ts, this.progress_13_ts, this.progress_14_ts);
          this.error.progress_14 = this.compareTime(this.progress_13_ts, this.progress_14_ts, this.progress_15_ts);
          this.error.progress_15 = this.compareTime(this.progress_14_ts, this.progress_15_ts, this.progress_16_ts);
          this.error.progress_16 = this.compareTime(this.progress_15_ts, this.progress_16_ts, null);
        }
      },
      planTimes() {
        this.planTimes.forEach(({id, planTime}) => {
          this.form[`progress_${id}`] = formatDate(planTime)
        })
      }
    },
    methods: {
      compareTime(prev, current, next) {
        if (!current) {
        } else if (prev && prev > current) {
          return '所选时间必须大于上一个时间';
        } else if (next && next < current) {
          return '所选时间必须小于下一个时间';
        // } else if (current > this.dateLimit) {
        //   return '所选时间必须小于约定工期'
        }
        return '';
      },
      cancel() {
        closeWindow()
      },
      async confirm() {
        if (this.hasErrors) {
          return;
        }
        let {c, m} = await setProgressPlanTime(this.project.jpid, this.form);
        if (c === 0) {
          toast(m)
        }
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .project-progress-plantime-container {
        padding: 10px 16px;
        .date-limit {
            padding: 0 4px;
            line-height: 25px;
            font-size: 12px;
            color: #8D92A3;
            // background-color: #f3f3f3;
            -webkit-border-radius: 4px;
            -moz-border-radius: 4px;
            border-radius: 4px;
            -ms-word-break: break-all;
            word-break: break-all;
        }
        .plan-times {
            list-style: none;
            margin-top: 20px;
            li {
                position: relative;
                font-size: 14px;
                color: #22242A;
                // &:first-child:before,
                &:after {
                    position: absolute;
                    content: '';
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: #dadada;
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
        .buttons {
          position: fixed;
          bottom: 2.5%;
          width: 90%;
          display: flex;
          justify-content: space-between;
          .sure-add_btn, .cancle-add_btn {
            width: 43%;
            text-align: center;
            color: #fff;
            height: 40px;
            line-height: 40px;
            border-radius: 20px;
            position: relative;

          }
          .sure-add_btn {
            background: #6478D3;
          }
          .cancle-add_btn {
            background: #CDCDD7;
          }
          // .btn-animation-ripple {
          //   text-align: center;
          //   height: 46px;
          //   color: #ffffff;
          //   line-height: 46px;
          //   border-radius: 23px;
          //   width: 30%!important;
          // }
        }
        
        // .buttons {
        //     position: absolute;
        //     bottom: 0;
        //     left: 0;
        //     right: 0;
        //     display: flex;
        //     display: -webkit-flex;
        //     line-height: 50px;
        //     text-align: center;
        //     > div {
        //         // flex: 1;
        //         width: 162px;
        //         overflow: hidden;
        //         &.confirm {
        //             color: #fff;
        //             background-color: @baseColor;
        //             & + .cancel {
        //                 position: relative;
        //                 &:before {
        //                     position: absolute;
        //                     left: 0;
        //                     top: 0;
        //                     width: 1px;
        //                     height: 100%;
        //                     content: '';
        //                     background-color: #e0dcdc;
        //                     -webkit-transform: scaleX(0.5);
        //                     -moz-transform: scaleX(0.5);
        //                     -ms-transform: scaleX(0.5);
        //                     -o-transform: scaleX(0.5);
        //                     transform: scaleX(0.5);
        //                 }
        //             }
        //         }
        //         &.cancel {
        //             color: #7f7f7f;
        //             background-color: #dadada;
        //         }
        //     }
        //     &:before {
        //         position: absolute;
        //         left: 0;
        //         top: 0;
        //         height: 1px;
        //         width: 100%;
        //         content: '';
        //         background-color: #e0dcdc;
        //         -webkit-transform: scaleY(0.5);
        //         -moz-transform: scaleY(0.5);
        //         -ms-transform: scaleY(0.5);
        //         -o-transform: scaleY(0.5);
        //         transform: scaleY(0.5);
        //     }
        // }
    }
</style>
