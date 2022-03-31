import { useStore } from 'vuex'
import { computed, watch, ref } from 'vue'
import { getLyric } from '@/service/song'
import Lyric from 'lyric-parser'

export default function useLyric() {
    const currentLyric = ref(null)
    const currentLineNum = ref(0)

    const store = useStore()
    const currentSong = computed(() => store.getters.currentSong)

    watch(currentSong, async(newSong) => {
        if (!newSong.url || !newSong.id) {
            return
        }

        const lyric = await getLyric(newSong)
            // console.log(lyric)
        store.commit('addSongLyric', {
            song: newSong,
            lyric
        })

        // 请求的时候切歌了
        if (currentSong.value.lyric !== lyric) {
            return
        }
        currentLyric.value = new Lyric(lyric, handleLyric)
    })

    function handleLyric({ lineNum }) {
        currentLineNum.value = lineNum
    }

    return {
        currentLyric,
        currentLineNum
    }
}