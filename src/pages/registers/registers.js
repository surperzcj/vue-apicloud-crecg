import Vue from 'Vue'
import registers from './registers.vue'



import fastClick from 'fastclick'
 
fastClick.attach(document.body)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(registers)
});
