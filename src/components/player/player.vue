<template>
   <div class="player">
      <div class="normal-player" v-show="fullScreen">
          <div class="background">
              <img :src="currentSong.pic"/>
          </div>
          <div class="top">
              <div class="back" @click="goBack">
                  <i class="icon-back"></i>
              </div>
              <h1 class="title">{{currentSong.name}}</h1>
              <h2 class="subtitle">{{currentSong.singer}}</h2>
          </div>
          <div class="middle">
            <div class="middle-l">
              <div class="cd-wrapper">
                <div class="cd" ref="cdRef">
                  <img ref="cdImageRef" class="image" :class="cdCls" :src="currentSong.pic">
                </div>
              </div>
            </div>
            <scroll
            class="middle-r"
          >
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p
                  class="text"
                  :class="{'current': currentLineNum ===index}"
                  v-for="(line,index) in currentLyric.lines"
                  :key="line.num"
                >
                  {{line.txt}}
                </p>
              </div>
            </div>
          </scroll>
          </div>
          <div class="bottom">
              <div class="progress-wrapper">
                <span class="time time-l">{{formatTime(currentTime)}}</span>
                <div class="progress-bar-wrapper">
                  <progress-bar @progress-changing="onProgressChanging" @progress-changed="onProgressChanged" :progress="progress"></progress-bar>
                </div>
                <span class="time time-r">{{formatTime(currentSong.duration)}}</span>
              </div>
              <div class="operators">
                  <div class="icon i-left">
                      <i @click="changeMode" :class="modeIcon"></i>
                  </div>
                  <div class="icon i-left"  :class="disableCls">
                      <i @click="prev" class="icon-prev"></i>
                  </div>
                  <div class="icon i-center"  :class="disableCls">
                      <i @click="togglePlay" :class="playIcon"></i>
                  </div>
                  <div class="icon i-right"  :class="disableCls">
                      <i @click="next" class="icon-next"></i>
                  </div>
                  <div class="icon i-right">
                      <i @click="toggleFavorite(currentSong)" :class="getFavoritaIcon(currentSong)"></i>
                  </div>
              </div>
          </div>
      </div>
      <audio ref="audioRef" @pause="pause" @canplay="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
   </div>
</template>

<script>
import { useStore } from 'vuex'
import { computed, watch, ref } from 'vue'
import useMode from './use-mode'
import useFavorite from './use-favorite'
import useCd from './use-cd'
import useLyric from './use-lyric'
import ProgressBar from './progress-bar'
import Scroll from '@/components/base/scroll/scroll'
import { formatTime } from '@/assets/js/util'
import { PLAY_MODE} from '@/assets/js/constant'

export default {
  name: 'player',
  components: {
    ProgressBar,
    Scroll
  },
  setup() {
      // data
      const audioRef = ref(null)
      const songReady = ref(false)
      const currentTime = ref(0)
      let progresChanging = false

      //  vuex
      const store = useStore()
      const fullScreen = computed(() => store.state.fullScreen)
      const currentSong = computed(() => store.getters.currentSong)
      console.log(88)
      console.log('//////////////////')
      console.log(currentSong)
      const playing = computed(() => store.state.playing)
      const currentIndex = computed(() => store.state.currentIndex)
      const playMode = computed(() => store.state.playMode)

      // hooks
      const { modeIcon, changeMode } = useMode() // 是否时随机播放
      const { getFavoritaIcon, toggleFavorite } = useFavorite()
      const { cdCls, cdRef, cdImageRef } = useCd()
      const { currentLyric, currentLineNum } = useLyric()

      // computed
      const playlist = computed(() => store.state.playlist)

      const playIcon = computed(() => { // 暂停/播放的icon
          return playing.value ? 'icon-pause' : 'icon-play'
      })

      const progress = computed(() => {
        return currentTime.value / currentSong.value.duration
      })

      const disableCls = computed(() => {
        return songReady.value ? '' : 'disable'
      })

      // watch 侧重于逻辑
      watch(currentSong, (newSong) => {
        if (!newSong.id || !newSong.url) {
          return
        }
        currentTime.value = 0
        songReady.value = false
        const audioEl = audioRef.value
        audioEl.src = newSong.url
        audioEl.play()
        store.commit('setPlayState', true)
      })

      watch(playing, (newPlaying) => { // 暂停/播放
        if (!songReady.value) {
          return
        }
        currentTime.value = 0 // 切歌的时候要把它置为0
          const audioEl = audioRef.value
          newPlaying ? audioEl.play() : audioEl.pause()
      })
      // methods
      function goBack() {
          store.commit('setFullScreen', false)
      }

      function togglePlay() { // 播放状态
        if (!songReady.value) {
          return
        }
          store.commit('setPlayState', !playing.value)
      }

      function pause() { // 非交互状态下的暂停，例如电脑关了
          store.commit('setPlayState', false)
      }

      function prev() {
        const list = playlist.value
        if (!songReady.value || !list.length) { // 列表中没有歌
          return
        }
        if (list.length === 1) { // 列表中只有一首歌
          loop()
        } else {
          let index = currentIndex.value - 1
        if (index === -1) { // 当前歌曲是第一首时
          index = list.length - 1
        }
        store.commit('setCurrentIndex', index)
        if (!playing.value) {
          store.commit('setPlayState', true)
        }
        }
      }

      function next() {
        const list = playlist.value
        if (!songReady.value || !list.length) {
          return
        }
        if (list.length === 1) {
          loop()
        } else {
          let index = currentIndex.value + 1
        if (index === list.length) { // 当前歌曲是最后一首时
          index = 0
        }
        store.commit('setCurrentIndex', index)
        if (!playing.value) {
          store.commit('setPlayState', true)
        }
        }
      }

      function loop() {
        const audioEl = audioRef.value
        audioEl.currentTime = 0 // 当前播放歌曲时间为0，即从头开始播放
        audioEl.play()
        store.commit('setPlayState', true) // 因为end时候会触发pause()
      }

      function ready() {
        if (songReady.value) {
          return
        }
        songReady.value = true
      }

      function error() {
        songReady.value = true // 允许播放到下一首
      }

      function updateTime(e) {
        if (!progresChanging) {
          currentTime.value = e.target.currentTime
        }
      }

      function onProgressChanging(progress) {
        progresChanging = true
        currentTime.value = currentSong.value.duration * progress
      }
      function onProgressChanged(progress) {
        progresChanging = false
        audioRef.value.currentTime = currentTime.value = currentSong.value.duration * progress
        // audioRef.value.currentTime 这个currentTime是audio的属性吗
        if (!playing.value) { // 如果是暂停的 就播放
          store.commit('setPlayingState', true)
        }
      }

      function end() {
        currentTime.value = 0
        if (playMode.value === PLAY_MODE.loop) {
          loop()
        } else {
          next()
        }
      }

      return {
          fullScreen,
          currentSong,
          currentTime,
          audioRef,
          goBack,
          playIcon,
          togglePlay,
          pause,
          prev,
          next,
          ready,
          disableCls,
          progress,
          error,
          updateTime,
          formatTime,
          onProgressChanging,
          onProgressChanged,
          end,
          //  use-mode.js
          modeIcon,
          changeMode,
          // favorite
          getFavoritaIcon,
          toggleFavorite,
          // cd
          cdCls,
          cdImageRef,
          cdRef,
          // lyric
          currentLyric,
          currentLineNum
      }
  }
}
</script>

<style lang="scss" scoped>
  .player {
    .normal-player {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 150;
      background: $color-background;
      .background {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.6;
        filter: blur(20px);
        img {
          width: 100%;
          height: 100%;
        }
      }
      .top {
        position: relative;
        margin-bottom: 25px;
        .back {
          position: absolute;
          top: 0;
          left: 6px;
          z-index: 50;
          .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
          }
        }
        .title {
          width: 70%;
          margin: 0 auto;
          line-height: 40px;
          text-align: center;
          @include no-wrap();
          font-size: $font-size-large;
          color: $color-text;
        }
        .subtitle {
          line-height: 20px;
          text-align: center;
          font-size: $font-size-medium;
          color: $color-text;
        }
      }
      .middle {
        position: fixed;
        width: 100%;
        top: 80px;
        bottom: 170px;
        white-space: nowrap;
        font-size: 0;
        .middle-l {
          display: inline-block;
          vertical-align: top;
          position: relative;
          width: 100%;
          height: 0;
          padding-top: 80%;
          .cd-wrapper {
            position: absolute;
            left: 10%;
            top: 0;
            width: 80%;
            box-sizing: border-box;
            height: 100%;
            .cd {
              width: 100%;
              height: 100%;
              border-radius: 50%;
              img {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                border-radius: 50%;
                border: 10px solid rgba(255, 255, 255, 0.1);
              }
              .playing {
                animation: rotate 20s linear infinite
              }
            }
          }
        }
        .middle-r {
          display: inline-block;
          vertical-align: top;
          width: 100%;
          height: 100%;
          overflow: hidden;
          .lyric-wrapper {
            width: 80%;
            margin: 0 auto;
            overflow: hidden;
            text-align: center;
            .text {
              line-height: 32px;
              color: $color-text-l;
              font-size: $font-size-medium;
              &.current {
                color: $color-text;
              }
            }
            .pure-music {
              padding-top: 50%;
              line-height: 32px;
              color: $color-text-l;
              font-size: $font-size-medium;
            }
          }
        }
      }
      .bottom {
        position: absolute;
        bottom: 50px;
        width: 100%;
        .dot-wrapper {
          text-align: center;
          font-size: 0;
          .dot {
            display: inline-block;
            vertical-align: middle;
            margin: 0 4px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: $color-text-l;
            &.active {
              width: 20px;
              border-radius: 5px;
              background: $color-text-ll;
            }
          }
        }
        .progress-wrapper {
          display: flex;
          align-items: center;
          width: 80%;
          margin: 0px auto;
          padding: 10px 0;
          .time {
            color: $color-text;
            font-size: $font-size-small;
            flex: 0 0 40px;
            line-height: 30px;
            width: 40px;
            &.time-l {
              text-align: left;
            }
            &.time-r {
              text-align: right;
            }
          }
          .progress-bar-wrapper {
            flex: 1;
          }
        }
        .operators {
          display: flex;
          align-items: center;
          .icon {
            flex: 1;
            color: $color-theme;
            &.disable {
              color: $color-theme-d;
            }
            i {
              font-size: 30px;
            }
          }
          .i-left {
            text-align: right;
          }
          .i-center {
            padding: 0 20px;
            text-align: center;
            i {
              font-size: 40px;
            }
          }
          .i-right {
            text-align: left
          }
          .icon-favorite {
            color: $color-sub-theme;
          }
        }
      }
    }
  }
</style>
