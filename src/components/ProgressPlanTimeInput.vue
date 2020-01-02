<template>
    <div :class="{'has-error': error}">
        <div class="weui-flex time-box">
            <div class="weui-flex__item time-label" v-text="label"></div>
            <div class="plan-time-input weui-flex__item">
                <input type="text" class="weui-input" :placeholder="placeholder" disabled v-model="value"/>
                <input type="date" v-model="date"/>
            </div>
        </div>
        <div class="tip" v-text="`*${error}`"></div>
    </div>
</template>

<script>
  import {formatDate, parseTimestamp} from "../utils/CommonUtils";

  export default {
    name: 'progress-plan-time-input',
    props: {
      placeholder: {
        type: String,
        default() {
          return '请输入'
        }
      },
      label: String,
      value: null,
      error: {
        type: String,
        default() {
          return null
        }
      }
    },
    data() {
      return {
        date: null
      }
    },
    watch: {
      date() {
        this.$emit('input', formatDate(parseTimestamp(this.date)))
      }
    }
  }
</script>

<style scoped lang="less">
    .has-error {
        .tip {
            display: block;
        }
        .tip,
        .plan-time-input input,
        .time-label {
            color: #ec1634;
        }
    }

    .time-label {
        font-size: 15px;
        line-height: 42px;
        color: #151526;
    }

    .tip {
        display: none;
        padding-bottom: 8px;
        font-size: 12px;
        color: #bcb6b6;
    }

    .plan-time-input {
        position: relative;
        height: 42px;
        input {
            padding-right: 20px;
            height: 42px;
            width: 100%;
            font-size: 13px;
            text-align: right;
            font-size: 14px;
            color: #8D92A3;
        }
        input[type=date] {
            position: absolute;
            left: 0;
            top: 0;
            background-color: red;
            opacity: 0;
        }
        &:after {
            position: absolute;
            content: '';
            right: 0;
            top: -1px;
            width: 11px;
            height: 100%;
            background-image: data-uri('image/png;base64', '../assets/images/Calendar.png');
            background-size: 11px;
            background-repeat: no-repeat;
            background-position: center;
        }
    }
    .time-box {
      padding: 10px 0;
    }
</style>