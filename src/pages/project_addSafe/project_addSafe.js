import Vue from 'Vue'
import project_add from './project_addSafe.vue'



import fastClick from 'fastclick'
 
fastClick.attach(document.body)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(project_add)
})
