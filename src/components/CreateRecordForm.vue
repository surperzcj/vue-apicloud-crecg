<template>
    <div v-show="visible">
        <div class="weui-mask"></div>
        <div class="create-content animated" :class="{'bounceIn': visible}">
            <div class="title">添加备注</div>
            <textarea title="备注" v-model="message" class="weui-textarea content" rows="4"></textarea>
            <div class="buttons">
                <div class="confirm" @click="confirm">确定</div>
                <div class="cancel" @click="cancel">取消</div>
            </div>
        </div>
    </div>
</template>

<script>
  import {toast} from "../utils/ApiCloudUtils";

  export default {
    name: 'create-record-form',
    data() {
      return {
        message: null
      }
    },
    props: {
      visible: {
        type: Boolean,
        default() {
          return false
        }
      },
      remark: {
        type: String,
        default() {
          return null
        }
      }
    },
    methods: {
      cancel() {
        this.message = null;
        this.$emit('update:visible', false);
      },
      confirm() {
        if (!this.message) {
          return toast('请输入内容')
        }
        this.$emit('confirmed', this.message);
        this.cancel();
      }
    },
    watch: {
      visible() {
        this.message = this.remark
      }
    }
  }
</script>

<style lang="less" scoped>
    @import "../assets/style";
    @import "~animate.css";

    .create-content {
        @height: 200px;
        @width: 300px;
        position: fixed;
        left: 50%;
        top: 50%;
        height: @height;
        width: @width;
        margin-left: -@width/2;
        margin-top: -@height/2;
        z-index: 10001;
        background-color: #fff;
        -webkit-border-radius: 10px;
        -moz-border-radius: 10px;
        border-radius: 10px;

        .title {
            padding-top: 28px;
            padding-bottom: 17px;
            font-size: 18px;
            text-align: center;
            color: #010101;
        }

        .content {
            padding: 3px 7px;
            position: relative;
            margin: 0 auto;
            width: 262px;
            height: 68px;
            -webkit-border-radius: 5px;
            border-radius: 5px;
            border: 1px solid #bfbfbf;
        }

        .buttons {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            display: -webkit-flex;
            line-height: 50px;
            text-align: center;
            > div {
                flex: 1;
                overflow: hidden;
                &.confirm {
                    color: #3f67eb;
                    & + .cancel {
                        position: relative;
                        &:before {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 1px;
                            height: 100%;
                            content: '';
                            background-color: #e0dcdc;
                            -webkit-transform: scaleX(0.5);
                            -moz-transform: scaleX(0.5);
                            -ms-transform: scaleX(0.5);
                            -o-transform: scaleX(0.5);
                            transform: scaleX(0.5);
                        }
                    }
                }
                &.cancel {
                    color: #ef376e;
                }
            }
            &:before {
                position: absolute;
                left: 0;
                top: 0;
                height: 1px;
                width: 100%;
                content: '';
                background-color: #e0dcdc;
                -webkit-transform: scaleY(0.5);
                -moz-transform: scaleY(0.5);
                -ms-transform: scaleY(0.5);
                -o-transform: scaleY(0.5);
                transform: scaleY(0.5);
            }
        }
    }
</style>