<template>
    <div id="app">
        <Guide v-if="!viewedGuide" v-on:confirm="guideConfirm"/>
        <Home v-if="viewedGuide&&isLogin" v-on:logout="logout"/>
        <Login v-if="viewedGuide&&!isLogin" v-on:loginSuccess="loginSuccess"/>
    </div>
</template>

<script>

  import Home from './Home'
  import Login from './Login'
  import Guide from './Guide'
  import {getUserData, isUserLogin, setUserViewedGuide, userViewGuide} from "../../utils/CacheUtils";
  import RongCloud from "../../utils/RongCloud";
  import {apiReady, sendEvent} from "../../utils/ApiCloudUtils";
  import {getSqliteClient, insertMessageToDb} from "../../utils/Sqlite";

  export default {
    name: 'app',
    data() {
      return {
        isLogin: isUserLogin(),
        rongCloud: null,
        sqlite: null,
        viewedGuide: userViewGuide()
      }
    },
    components: {Home, Login, Guide},
    async mounted() {
      await apiReady();
      window.api.setStatusBarStyle({ style: 'dark' });
      window.api.removeLaunchView({animation: {type: 'none'}});
      window.api.addEventListener({
        name: 'noticeclicked'
      }, function (ret, error) {
        console.log('noticeclicked', JSON.stringify(ret, null, 4), error);
        if (ret && ret.value) {
          var result = ret.value;
          console.log('click message', JSON.stringify(result, null, 4))
        }
      });
      this.rongCloud = new RongCloud();

      this.openDatabase();
      this.initJpush();
      this.connectRongCloud();

      window.api.addEventListener({
        name: 'smartupdatefinish'
      }, () => {
        window.api.rebootApp();
      })

      window.api.addEventListener({
        name: 'user_logout'
      }, () => {
        window.api.closeFrameGroup({name: 'home_content'});
        this.isLogin = false;
      })
    },
    methods: {
      guideConfirm() {
        setUserViewedGuide();
        this.viewedGuide = true;
      },
      loginSuccess() {
        setTimeout(() => {
          this.isLogin = true;
        }, 300);
        this.connectRongCloud();
        this.initJpush();
      },
      logout() {
        setTimeout(() => {
          this.isLogin = false;
          this.rongCloud && this.rongCloud.disconnect();
        }, 100);
      },
      async initJpush() {
        // if (!isUserLogin()) {
        //   return;
        // }
        // let {userId, dpid} = getUserData();
        // ajpush.initAction(`user_${userId}`, ['users', `dp_${dpid}`]);
      },
      async connectRongCloud() {
        if (!isUserLogin()) {
          return;
        }
        let {rongToken} = getUserData();
        await this.rongCloud.init();

        this.rongCloud.setOnReceiveMessageListener(ret => this.getRongCloudMessage(ret));
        await this.rongCloud.connect(rongToken);
      },
      async getRongCloudMessage({result}) {
        console.log('rong-cloud-get-message', JSON.stringify(result, null, 4));
        if (result && result.message) {
          await insertMessageToDb(result.message);
        }
        // 设置消息已读
        this.rongCloud.setMessageRead(result.message);
        sendEvent('rongcloud_get_message');
      },
      async openDatabase() {
        this.sqlite = await getSqliteClient();
      }
    }
  }
</script>

<style lang="less">

</style>
