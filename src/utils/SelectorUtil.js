let defaultOptions = {
  max: 0,
  singleSelection: true,
  animation: false,
  styles: {
    mask: 'rgba(0,0,0,0.3)',
    leftButton: {bg: 'transparent', color: '#f00'},
    rightButton: {bg: 'transparent', color: 'rgb(63, 103, 233)'},
    item: {
      h: 45,
      bgActive: '#eee',
      bgHighlight: '#eee',
      lineColor: '#ccc',
      textAlign: 'left'
    }
  },
  text: {
    leftBtn: '',
    rightBtn: '确定'
  },
  items: []
};

export const buildSelector = async (...args) => {
  let items = args.shift();
  let singleSelection = args.length >= 1 ? args.shift() : true;

  let options = Object.assign(defaultOptions, {items, singleSelection});
  let selector = window.api.require('UIMultiSelector');

  return new Promise(resolve => {
    selector.open(options, (ret, error) => {
      console.log('event', JSON.stringify(ret));
      if (!ret) {
        return resolve(null);
      }
      let {eventType, items} = ret;

      if (eventType === 'clickMask') {
        return resolve(null);
      }

      if (eventType === 'clickRight') {
        selector.close();
        
        if (singleSelection) {
          return resolve(items[0]);
        } else {
          return resolve(items);
        }

        return resolve(null);
      }

    });
  })
};