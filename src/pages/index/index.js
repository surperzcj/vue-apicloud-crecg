import Vue from 'Vue'
import app from './index.vue'
import VueAwesomeSwiper from 'vue-awesome-swiper'

import 'swiper/dist/css/swiper.css'



Vue.use(VueAwesomeSwiper)

import fastClick from 'fastclick'
 
fastClick.attach(document.body)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(app)
})
