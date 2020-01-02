import {apiReady} from "./ApiCloudUtils";

export const buildDatePicker = async () => {
  await apiReady();
  const UICalendar = window.api.require('UICalendar');
  setTimeout(function () {
    UICalendar.close();
  }, 15000);
  UICalendar.open({
    rect: {
      x: 30,
      y: window.api.frameHeight / 2 - 170,
      w: window.api.frameWidth - 60,
      h: 340
    },
    styles: {
      bg: 'rgba(0,0,0,.7)',
      week: {
        weekdayColor: '#3b3b3b',
        weekendColor: '#a8d400',
        size: 12
      },
      date: {
        color: '#fffff',
        selectedColor: '#fff',
        selectedBg: '#a8d500',
        size: 12
      },
      today: {
        color: 'rgb(230,46,37)',
        bg: ''
      },
      specialDate: {
        color: '#a8d500',
        bg: 'widget://image/a.png'
      }
    },
    // specialDate: [{// date: '2015-06-01'}],
    switchMode: 'horizontal',
    // fixedOn: window.api.winName,
    fixed: true
  }, function (ret, err) {
    if (ret) {
      // alert(JSON.stringify(ret));
    } else {
      // alert(JSON.stringify(err));
    }
  });
};