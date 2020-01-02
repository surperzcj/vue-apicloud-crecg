export default class Wx {
  constructor() {
    this.wx = window.api.require('wx');
  }

  async installed() {
    return new Promise(resolve => {
      this.wx.isInstalled(({installed}) => resolve(installed))
    })
  }

  async shareWebPage({pname: title, jpid}) {
    return new Promise(resolve => {
      this.wx.shareWebpage({
        scene: 'session',
        title,
        description: '',
        thumb: 'widget://images/app-icon.png',
        contentUrl: 'http://app.bjtkcloud.com/m/index.html#/project/' + jpid
      }, ({status}, err) => {
        resolve(Boolean(status))
      });
    })
  }
}
