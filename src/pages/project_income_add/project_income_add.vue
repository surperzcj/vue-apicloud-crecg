<template>
    <div id="app">
        <div class="project-member-add">
            <div class="project-name ">
                我方单位
                <p v-text="project.selfUnitName"></p>
            </div>
            <div class="project-name project-line">
                业主单位
                <p v-text="project.ownerUnit"></p>
            </div>
        </div>

        <div class="project-add-form">
            <div class="form-item">
                <label>进款时间</label>
                <input type="text" placeholder="请选择进款时间" readonly v-model="date"/>
                <input type="date" class="project-add-form-date" v-model="actDate">
            </div>
            <div class="form-item">
                <label>进款金额</label>
                <input type="number" placeholder="请输入进款金额" v-model="money"/>
            </div>
        </div>
        <div class="user-form-buttons" v-if="project.canEdit">
            <a href="javascript:;" class="weui-btn weui-btn_mini weui-btn_primary sure-add" @click="save">确认添加</a>
            <a href="javascript:;" class="weui-btn weui-btn_mini weui-btn_default cancle-add" @click="closeWindow">取消添加</a>
        </div>
    </div>
</template>

<script>
  import {closeWindow, getPageParams, toast} from "../../utils/ApiCloudUtils";
  import {formatDate} from "../../utils/CommonUtils";
  import {createProjectIncome} from "../../utils/DataUtils";

  export default {
    name: 'app',
    data() {
      return {
        project: {},
        actDate: '',
        money: '',
        get date() {
          if (!this.actDate) {
            return null;
          }

          return formatDate(new Date(this.actDate).getTime(), 'yyyy年MM月dd日');
        },
      };
    },
    async created() {
      let {project} = await getPageParams();
      this.project = project;
    },
    methods: {
      closeWindow,
      async save() {
        if (!this.date) {
          return toast('请选择进款时间');
        }
        if (!this.money) {
          return toast('请输入金额');
        }

        let {c, m} = await createProjectIncome(this.project.jpid, this.date, this.money);
        if (c !== 0) {
          return;
        }

        toast(m);
        this.actDate = '';
        this.money = '';
      },
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .project-member-add {
        padding: 20px 14px 0;

        .project-name {
            position: relative;
            padding-left: 8px;
            padding-top: 20px;
            padding-bottom: 5px;
            font-size: 15px;
            letter-spacing: 1px;
            line-height: 24px;
            font-weight: 900;
            background-color: #fff;

              // border-bottom: 1px  solid #000;
              // overflow: hidden;
              

            // &:before {
            //     position: absolute;
            //     content: ' ';
            //     left: 11px;
            //     top: 20.5px;
            //     width: 5.5px;
            //     height: 22px;
            //     background: #3dcf7a;
            //     -webkit-border-radius: 3.8px;
            //     -moz-border-radius: 3.8px;
            //     border-radius: 3.8px;
            // }

            &:last-child {
                padding-top: 5px;
                &:before {
                    top: 5.5px;
                }
            }
            p {
              float: right;
                font-size: 13px;
                color: #7f7f7f;
                max-width: 230px;
                // text-align: right;
            }
        }
        .project-line {
          // border-bottom: 1px solid #dadada;
          padding-top: 20px!important;
          &::before {
            position: absolute;
            content: '';
            top: 0;
            left: 22px;
            right: 22px;
            height: 1px;
            background: #dadada;
            -webkit-transform: scaleY(0.5);
            -moz-transform: scaleY(0.5);
            -ms-transform: scaleY(0.5);
            -o-transform: scaleY(0.5);
            transform: scaleY(0.5);
          }
        }
    }

    .project-add-form {
        margin-top: 44px;
        padding-bottom: 0;
    }

    .project-add-form .form-item:first-child:after {
        position: absolute;
        content: '';
        top: 0;
        left: 22px;
        right: 22px;
        height: 1px;
        background: #dadada;
        -webkit-transform: scaleY(0.5);
        -moz-transform: scaleY(0.5);
        -ms-transform: scaleY(0.5);
        -o-transform: scaleY(0.5);
        transform: scaleY(0.5);
    }
    .user-form-buttons {
      display: flex;
      justify-content: space-around;
      .sure-add, .cancle-add {
        width: 40%!important;
        margin: 0;
      }
      .sure-add {
        background: #6478D3;
        
      }
      .cancle-add {
        background: #CDCDD7;
        color: #fff;
        
      }
    }
</style>
