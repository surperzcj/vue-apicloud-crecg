import {apiReady} from "./ApiCloudUtils";

class Ajpush {

  async getApjush() {
    await apiReady();
    if (!this.ajpush) {
      this.ajpush = window.api.require('ajpush');
    }

    return this.ajpush;
  }

  async init() {
    const ajpush = await this.getApjush();
    return new Promise((resolve, reject) => {
      try {
        ajpush.init(ret => {
          console.log('init-result', JSON.stringify(ret));
          resolve();
        });
      } catch (e) {
        console.error('init-error', e);
        reject();
      }
    });
  }

  async bind(alias, tags = []) {
    console.log('ajpush-bind-params', 'alias', alias, 'tags', tags);
    const ajpush = await this.getApjush();
    return new Promise((resolve, reject) => {
      try {
        console.log('ajpush-bind-start', 1);
        ajpush.bindAliasAndTags({
          alias, tags
        }, ret => {
          console.log('ajpush-bind-result', JSON.stringify(ret));
          resolve();
        });
      } catch (e) {
        console.error('ajpush-bind-error', e);
        reject();
      }
    });
  }

  initAction(alias, tags = []) {
    this.init();
    this.bind(alias, tags);

    window.api.addEventListener({name: 'appintent'}, function (ret, err) {
      console.log('通知被点击，收到数据', JSON.stringify(ret, null, 4));//监听通知被点击后收到的数据
    })
  }
}

export default new Ajpush();