<template>
    <swiper ref="mySwiper" class="guide-container">
        <swiper-slide><img src="../../assets/images/guide-1.png"></swiper-slide>
        <swiper-slide><img src="../../assets/images/guide-2.png"></swiper-slide>
        <swiper-slide>
            <img src="../../assets/images/guide-3.png">
            <div class="guide-container-confirm" @click="confirm"></div>
        </swiper-slide>
    </swiper>
</template>

<script>
  import {swiper, swiperSlide} from 'vue-awesome-swiper'

  export default {
    name: "guide",
    components: {swiper, swiperSlide},
    data() {
      return {
        swiperOption: {
          notNextTick: true,
          direction: 'horizontal',
          slidesPerView: 'auto',
          centeredSlides: true,
          paginationClickable: true,
          spaceBetween: 30,
        }
      }
    },
    methods: {
      confirm() {
        this.$emit('confirm')
      }
    }

  }
</script>

<style lang="less">
    .guide-container {
        height: 100%;
        .swiper-slide {
            position: relative;
            height: 100%;
            & > img {
                height: 100%;
                width: 100%;
            }
        }
        .guide-container-confirm {
            position: absolute;
            left: 31%;
            top: 61%;
            height: 35px;
            width: 37%;
            z-index: 999;
        }
    }
</style>