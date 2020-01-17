import Vue from 'Vue'
import smallTalk from './smallTalk.vue'



import fastClick from 'fastclick'
 
fastClick.attach(document.body)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(smallTalk)
});
