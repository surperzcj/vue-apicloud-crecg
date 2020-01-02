<template>
    <div id="app">
        <div class="project-member-add">
            <div class="project-name">
                我方单位
                <span v-text="project.selfUnitName" ></span>
                <!-- <p v-text="project.selfUnitName"></p> -->
            </div>
            <div class="project-name project-line">
                业主单位
                <span v-text="project.ownerUnit" ></span>
                <!-- <p v-text="project.ownerUnit"></p> -->
            </div>
        </div>
        <div class="project-add-form">
            <div class="form-item">
                <label>开票时间</label>
                <input type="text" placeholder="请选择开票时间" readonly v-model="form.time"/>
                <input type="date" class="project-add-form-date" v-model="form.actDate">
            </div>
            <div class="form-item">
                <label>发票号码</label>
                <input type="text" placeholder="请输入发票号码" v-model="form.number"/>
            </div>
            <div class="form-item">
                <label>金额</label>
                <input type="number" placeholder="请输入金额" v-model="form.money"/>
            </div>
            <div class="form-item">
                <label>开票公司</label>
                <input type="text" placeholder="请输入开票公司" v-model="form.unitName"/>
            </div>
            <div class="form-item">
                <label>发票内容</label>
                <input type="text" placeholder="请输入发票内容" v-model="form.content"/>
            </div>
        </div>
        <div class="user-form-buttons" v-if="project.canEdit">
            <a href="javascript:;" class="weui-btn weui-btn_mini weui-btn_primary sure-add" @click="save">确认添加</a>
            <a href="javascript:;" class="weui-btn weui-btn_mini weui-btn_default cancle-add" @click="closeWindow">取消添加</a>
        </div>
    </div>
</template>

<script>
  import {getPageParams, closeWindow, toast} from "../../utils/ApiCloudUtils";
  import {formatDate} from "../../utils/CommonUtils";
  import {createProjectInvoice} from "../../utils/DataUtils";

  export default {
    name: 'app',
    data() {
      return {
        project: {},
        form: {
          actDate: '',
          money: '',
          number: '',
          content: '',
          unitName: '',
          get time() {
            if (!this.actDate) {
              return null;
            }

            return formatDate(new Date(this.actDate).getTime(), 'yyyy年MM月dd日');
          },
        }
      };
    },
    async created() {
      let {project} = await getPageParams();
      this.project = project;
    },
    methods: {
      closeWindow,
      checkForm() {
        let errors = {
          money: '请输入开票金额',
          number: '请输入发票号码',
          content: '请输入开票内容',
          unitName: '请输入开票公司',
          time: '请选择开票时间',
        };
        for (let key in errors) {
          if (!this.form[key]) {
            toast(errors[key]);
            return false;
          }
        }
        return true;
      },
      async save() {
        if (!this.checkForm()) {
          return;
        }

        let {c, m} = await createProjectInvoice(this.project.jpid, this.form);
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

    .project-member-add {
        // padding: 0 14px; 
        padding-top: 5.5%;

        .project-name {
            position: relative;
            // padding-left: 26px;
            // padding-top: 20px;
            // padding-bottom: 5px;
            padding: 0 5.5%;
            // font-size: 15px;
            letter-spacing: 1px;
            line-height: 24px;
            font-weight: normal;
            background-color: #fff;
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: #22242A;
            height: 64px;
            line-height: 64px;

            span {
              font-size: 14px;
              color: #888888;
            }

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
                font-size: 13px;
                color: #7f7f7f;
            }
        }

        .project-line {
          position: relative;
          &::before {
            position: absolute;
            content: '';
            bottom: 0;
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

    .form-item {
      padding: 0 5.5% !important;
      
      label {
        font-size: 14px !important;
        color: #22242A !important;
        font-weight: normal;
      }

      input {
        font-size: 14px;
        color: #8D92A3;
      }
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

    .project-add-form {
        // margin-top: 44px;
        padding-bottom: 0;
    }

    .user-form-buttons {
      position: fixed;
      bottom: 3%;
      width: 100%;
      
      a {
        width: 43%;
        height: 46px;
        line-height: 46px;
        border-radius: 23px;
      }
    }
</style>
