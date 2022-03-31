<template>
   <div class="singer-detail">
      <music-list :songs="songs" :title="title" :pic="pic" :loading="loading"></music-list>
   </div>
</template>

<script>
import { getSingerDetail } from '@/service/singer'
import { processSongs } from '@/service/song'
import MusicList from '@/components/music-list/music-list'
import storage from 'good-storage'
import { SINGER_KEY } from '@/assets/js/constant'

export default {
  name: 'singer-detail',
  components: { MusicList },
  props: {
      singer: Object
  },
  data() {
      return {
          songs: [],
          loading: true
      }
  },
  computed: {
      conputerSinger() {
          let ret = null
          const singer = this.singer
          if (singer) {
              ret = singer
          } else { // 取缓存的
              const cachedSinger = storage.session.get(SINGER_KEY)
              if (cachedSinger && cachedSinger.mid === this.$route.params.id) { // 在当前页刷新的
                  ret = cachedSinger
              }
          }
          return ret
      },
      pic() {
          const singer = this.conputerSinger
          return singer && singer.pic
      },
      title() {
          const singer = this.conputerSinger
          return singer && singer.name
      }
  },
  async created() {
      if (!this.conputerSinger) { // 当conputerSinger为null的时候，就是随便在url里改数字，默认返回上一级
          const path = this.$route.matched[0].path // /singer
          // console.log(path)
          this.$router.push({
              path
          })
          return
      }
      const result = await getSingerDetail(this.conputerSinger)
      // console.log(result)
      this.songs = await processSongs(result.songs)
      // console.log(this.songs)
      this.loading = false // 加载完数据后关掉loading
  }
}
</script>

<style lang="scss" scoped>
.singer-detail {
    position: fixed;
    z-index: 10;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: $color-background;
}
</style>
