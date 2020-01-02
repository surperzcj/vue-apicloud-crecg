<template>
    <div class="percent">
        <span class="title">{{title}}:</span>
        <div class="percent-content">
            <span :style="style"></span>
        </div>
        <span class="succeed" v-if="showSucceed" :style="diffColors"> {{ percentText }} </span>
        <span class="percent-text" v-else v-text="percentText" :style="diffColors"></span>
    </div>
</template>

<script>
  export default {
    name: 'project-progress-percent',
    props: {
      percent: Number,
      title: '',
      theme: {
        type: String,
        default () {
          return 'blue'
        }
      },
      changeColor: {
        type: String,
        default () {
          return 'blue'
        }
      }
    },
    computed: {
      colors () {
        if (this.theme === 'blue') {
          return {
            normal: '#6478D3',
            succeed: '#6478D3'
          }
        } else if (this.theme === 'red') {
          return {
            normal: '#6478D3',
            succeed: '#6478D3',
            color: "#EF4B5F"
          }
        }
      },
      diffColors() {
        if(this.changeColor === 'blue') {
          return {color: '#EF4B5F'}
        } else {
          return {color: '#51DC8E'}
        }
      },
      showSucceed () {
        return this.percent === 100
      },
      percentText () {
        return `${this.percent}%`
      },
      style () {
        const { normal, succeed } = this.colors
        return {
          width: this.percentText,
          backgroundColor: this.showSucceed ? succeed : normal
        }
      },
      percentTextStyle () {
        const { normal: color } = this.colors
        return { color }
      }
    }
  }
</script>

<style scoped lang="less">
    .percent {
        display: flex;
        height: 22px;
        float: left;

        .title {
          color: #8D92A3;
        }

        .percent-content {
            flex: 1;
            margin-top: 9px;
            margin-right: 3px;
            margin-left: 6px;
            float: right;
            position: relative;
            display: inline-block;
            width: 9vw;
            height: 4px;
            background: #dedede;
            vertical-align: 2px;
            border-radius: 2px;
            overflow: hidden;

            & > span {
                position: absolute;
                display: inline-block;
                height: 100%;
                border-radius: 2px;
            }
        }

        .succeed {
            display: inline-block;
            vertical-align: -1px;
            margin-top: 4px;
            height: 13px;
            line-height: 13px;
            width: 27px;
            // background: data-uri('image/png;base64', '../assets/images/icon-project-progress-finish.png') no-repeat;
            // background-position-x: center;
            // background-position-y: 0;
            // background-size: 13px;
        }

        .percent-text {
            width: 27px;
            text-align: center;
        }
    }
</style>
