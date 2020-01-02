<template>
    <div class="hello">
        <h1 v-text="msg">123213</h1>
        <h1>asdasd</h1>
        <h1>asdasd</h1>
        <h1>asdasd</h1>
        <h1>asdasd</h1>
        <h1>asdasd</h1>
        <h1>asdasd</h1>
        <h1>asdasd</h1>
        <h1>asdasd</h1>
        <h1>asdasd</h1>
    </div>
</template>

<script>
  import {apiReady} from "../utils/ApiCloudUtils";

  export default {
    name: 'cell',
    data() {
      return {
        msg: '多页面测试2'
      }
    },
    created() {
      
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
