<template>
    <div class="slider">
      <div class="slides" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
        <div v-for="(anime, index) in animeList" :key="anime.mal_id" class="slide">
          <img :src="anime.images.jpg.image_url" :alt="anime.title" class="slide-image" />
        </div>
      </div>
      <button class="prev" @click="prevSlide">&#10094;</button>
      <button class="next" @click="nextSlide">&#10095;</button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      animeList: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        currentIndex: 0
      };
    },
    methods: {
      prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.animeList.length) % this.animeList.length;
      },
      nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.animeList.length;
      }
    }
  };
  </script>
  
  <style scoped>
  .slider {
    position: relative;
    width: 100%;
    height: 300px;
    overflow: hidden;
    border-radius: 12px;
  }
  
  .slides {
    display: flex;
    transition: transform 0.5s ease-in-out;
    width: 100%;
    height: 100%;
  }
  
  .slide {
    min-width: 100%;
    box-sizing: border-box;
  }
  
  .slide-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }
  
  .prev,
  .next {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    border-radius: 50%;
    font-size: 1.5rem;
    transition: background-color 0.3s ease;
  }
  
  .prev:hover,
  .next:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
  
  .prev {
    left: 10px;
  }
  
  .next {
    right: 10px;
  }
  </style>