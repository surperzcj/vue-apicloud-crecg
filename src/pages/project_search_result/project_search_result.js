import Vue from 'Vue'
import app from './project_search_result.vue'



import fastClick from 'fastclick'
 
fastClick.attach(document.body)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(app)
});
