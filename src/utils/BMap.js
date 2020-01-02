import {getPositionByCode} from "./regions";

export default class BMap {

  constructor(map) {
    this.map = map;
  }

  // 本接口仅支持 iOS 平台，android平台不需要初始化
  init() {
    return new Promise(resolve => {
      if (!this.map.initMapSDK) {
        return resolve(true);
      }
      this.map.initMapSDK(ret => {
        console.log('init-bmap', JSON.stringify(ret));
        resolve(true);
      });
    });
  }

  openMap() {
    return new Promise(resolve => {
      this.map.open({
        rect: {
          x: 0,
          y: 0,
          w: window.api.frameWidth,
          h: window.api.frameHeight - 50 - window.api.safeArea.bottom
        },
        center: {// 背景坐标
          lon: 116.4021310000,
          lat: 39.9994480000
        },
        zoomLevel: 8,
        showUserLocation: true,
        fixedOn: window.api.frameName,
        fixed: true
      }, ret => {
        console.log('open map result' + JSON.stringify(ret, null, 4));
        resolve();
      });

    });
  }

  tabActiveAnnotation(ret, callback) {
    let {latitude, longitude, name} = getPositionByCode(ret.id);
    ret.lat = latitude;
    ret.lon = longitude;
    ret.name = name;

    this.addAnnotations([ret], callback, true);
    if (this.lastAnnotation) {
      this.addAnnotations([this.lastAnnotation], callback, false);
    }

    this.lastAnnotation = ret;
  }

  addAnnotations(annotations = [], callback, active = false) {
    let icon = `widget://images/icon-location${active ? '-active' : ''}.png`;
    console.info('icon', icon);
    annotations = annotations.map(item=>{
      item.size = 30;
      return item
    })
    this.map.addAnnotations({
      annotations,
      icon,
      draggable: true
    }, ret => {
      console.log('addAnnotations：' + JSON.stringify(ret, null, 4));
      if (!ret) {
        return;
      }
      callback(ret.id);
      this.tabActiveAnnotation(ret, callback);
    });
  }
}
