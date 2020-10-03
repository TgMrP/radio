<template>
  <div class="">
    <div class="flex flex-col px-4">
      <div class="station cursor-pointer max-w-4xl mx-auto" v-for="(station, i) in stations" :key="i" @click="setStation(i)" :class="{active: i === currentStation}">
        <div class="logo" style="width:30%;">
          <img :src="station.logo" :alt="station.name" class="mr-4 w-20 rounded-xxl border-2 border-black">
        </div>
        <!-- <div class="freq text-xl mx-6 md:mx-6 sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl text-white">
          {{ station.freq }}
        </div> -->
        <div class="name text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl mr-4 text-white font-light" style="width:50%;">
          {{ station.name }}
        </div>
        <!-- <div class="w-32">
          <div class="live" v-if="i === currentStation">LIVE</div>
        </div> -->
        <div class="ml-6 md:ml-0" style="width:20%;">
          <div class="playing" v-if="i === currentStation">
            <div class="rect1"></div>
            <div class="rect2"></div>
            <div class="rect3"></div>
            <div class="rect4"></div>
            <div class="rect5"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="pt-16" v-if="nowPlaying"></div>
    <div class="footer" v-if="nowPlaying && currentStation > -1">
      <div class="volume">
        <input type="range" v-model="volume" max="100" />
        <svg id="volume" viewBox="0 0 26.2 26.2" class="fill-current text-white h-6">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M21.1 13.1c0-3.3-2-6.2-4.9-7.4l-.8 1.8c2.2.9 3.7 3 3.7 5.5s-1.5 4.6-3.7 5.5l.8 1.8c2.9-1 4.9-3.9 4.9-7.2zm-4 0c0-1.7-1-3.1-2.5-3.7l-.8 1.8c.7.3 1.2 1 1.2 1.8s-.5 1.5-1.2 1.8l.8 1.8c1.5-.4 2.5-1.8 2.5-3.5zM17.7 2l-.8 1.8c3.6 1.5 6.2 5.1 6.2 9.2 0 4.2-2.5 7.7-6.2 9.2l.8 1.8c4.3-1.8 7.4-6.1 7.4-11.1s-3-9.1-7.4-10.9zM1.1 8.1v10h4l7 7v-24l-7 7h-4z"></path>
        </svg>
      </div>
      <div class="statName">{{  stations[currentStation].name }}</div>
      <div class="playpause" @click="setStation(currentStation)">
      <svg class="h-10 w-10 fill-current text-white cursor-pointer" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M224 435.8V76.1c0-6.7-5.4-12.1-12.2-12.1h-71.6c-6.8 0-12.2 5.4-12.2 12.1v359.7c0 6.7 5.4 12.2 12.2 12.2h71.6c6.8 0 12.2-5.4 12.2-12.2zM371.8 64h-71.6c-6.7 0-12.2 5.4-12.2 12.1v359.7c0 6.7 5.4 12.2 12.2 12.2h71.6c6.7 0 12.2-5.4 12.2-12.2V76.1c0-6.7-5.4-12.1-12.2-12.1z"/></svg>
      </div>
    </div>
  </div>
</template>
<script>
import {Howl,Howler} from 'howler';

export default {
  name: 'App',
  data() {
    return {
      stations: [
        {
          name: 'רדיו אמצע הדרך',
          logo: require('@/assets/2.jpg'),
          'freq': '90',
          src: 'https://icy.streamgates.net/Radio_CDN/Emtza_Haderech/icecast.audio'
        },
        {
          name: 'כאן 88',
          logo: require('@/assets/1.jpg'),
          'freq': '88',
          src: 'https://kanliveicy.media.kan.org.il/icy/kan88_mp3'
        },
        {
          name: 'רדיו לב המדינה',
          logo: require('@/assets/3.jpg'),
          'freq': '91',
          src: 'https://acdn.streamgates.net/91fm'
        }
        ,
        {
          name: 'רדיו תל אביב',
          logo: require('@/assets/4.jpg'),
          'freq': '102',
          src: 'https://102.livecdn.biz/102fm_mp3'
        }
        ,
        {
          name: 'רדיוס',
          logo: require('@/assets/5.jpg'),
          'freq': '100',
          src: 'https://acdn.streamgates.net/100fm'
        }
        ,
        {
          name: 'גלגל"צ',
          logo: require('@/assets/8.jpg'),
          'freq': '90',
          src: 'http://glzwizzlv.bynetcdn.com/glglz_mp3'
        }
        ,
        {
          name: 'אקו 99',
          logo: require('@/assets/7.jpg'),
          'freq': '90',
          src: 'https://eco-live.mediacast.co.il/99fm_aac'
        },
        {
          name: 'רדיו ללא הפסקה',
          logo: require('@/assets/9.jpg'),
          'freq': '103',
          src: 'https://acdn.streamgates.net/103fm'
        },
        {
          name: 'רדיו חיפה',
          logo: require('@/assets/11.jpg'),
          'freq': '107.5',
          src: 'http://1075.livecdn.biz/radiohaifa'
        }
      ],
      sound: null,
      nowPlaying: false,
      currentStation: null,
      volume: 50,
    }
  },
  methods: {
    clear() {
      this.nowPlaying = false;
      this.currentStation = null;
      this.sound = null;
    },
    setStation(i) {
      if(this.nowPlaying || this.sound) {
        this.sound.unload();
        this.nowPlaying = false;
      }
      if(this.currentStation != i) {
        this.sound = new Howl({
            src: this.stations[i].src,
            html5: true,
        });
        this.setVolume()
        this.sound.play();
        this.nowPlaying = true;
        this.currentStation = i;
      } else {
        this.clear();
      }
    },
    setVolume(){
      Howler.volume(this.volume / 100);
    }
  },
  watch: {
    volume() {
      this.setVolume();
    }
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;700&display=swap');

html{
  height:100%;
  width:100%;
  direction: rtl;
}

body {
  height:100%;
  width:99%;
  @apply bg-green-500;
}

.station {
  @apply my-2 w-full flex items-center justify-center rounded-xxl py-4;
}

.station:hover,
.active {
  background-color:rgba(255,255,255,.1)
}

.live{
  @apply px-2 text-4xl font-bold;
  background-color:#cc1919;
  border-radius:3px;
  color:#fff;
  font-size:2vw;
  line-height:3vw;
  display:inline-block;
  text-align:center;
  text-shadow:none;
}

.playing{
  width:100px;
  height:40px;
  text-align:center;
  -webkit-transition:all .2s ease;
  transition:all .2s ease;
}
.playing>div{
  background-color:#fff;
  height:100%;
  width:6px;
  display:inline-block;
  -webkit-transition:all .2s ease;
  transition:all .2s ease;
  -webkit-animation:wavy 1s ease infinite forwards;
  animation:wavy 1s ease infinite forwards;
  box-shadow:1px 1px 2px rgba(0,0,0,.33)
}
.playing .rect2{
  -webkit-animation-delay:.25s;
  animation-delay:.25s;
  margin-left: 1px;
}
.playing .rect3{
  -webkit-animation-delay:.5s;
  animation-delay:.5s;
  margin-left: 1px;
}
.playing .rect4{
  -webkit-animation-delay:.75s;
  animation-delay:.75s;
  margin-left: 1px;
}
.playing .rect5{
  -webkit-animation-delay:1s;
  animation-delay:1s;
  margin-left: 1px;
}

.footer {
  width: 90%;
  z-index: 10;
  bottom: 0;
  right: 5%;
  position: fixed;
  @apply bg-green-800 text-center h-16 border-t-2 border-green-300 flex items-center justify-between rounded-tr-xxl rounded-tl-xxl mx-auto;
  .volume {
    @apply mr-6 flex items-center justify-center;
    width: 30%;
    svg {
      @apply mr-2;
    }
    input {
      width:100%;
    }
  }
  .statName {
    @apply text-white font-bold;
    width: 50%;
    @screen md {
      @apply text-xl;
    }
  }
  .playpause {
    @apply ml-6;
    width: 10%;
  }
}

@-webkit-keyframes wavy{
  0%{
      -webkit-transform:scaleY(1);
      transform:scaleY(1)
  }
  50%{
      -webkit-transform:scaleY(.6);
      transform:scaleY(.6)
  }
  100%{
      -webkit-transform:scaleY(1);
      transform:scaleY(1)
  }
}
@keyframes wavy{
  0%{
      -webkit-transform:scaleY(1);
      transform:scaleY(1)
  }
  50%{
      -webkit-transform:scaleY(.6);
      transform:scaleY(.6)
  }
  100%{
      -webkit-transform:scaleY(1);
      transform:scaleY(1)
  }
}

</style>
