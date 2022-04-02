import { useStore } from 'vuex'
import { computed, watch, ref } from 'vue'
import { getLyric } from '@/service/song'
import Lyric from 'lyric-parser'

export default function useLyric({ songReady, currentTime }) {
    const currentLyric = ref(null)
    const currentLineNum = ref(0)
    const lyricScrollRef = ref(null)
    const lyricListRef = ref(null)

    const store = useStore()
    const currentSong = computed(() => store.getters.currentSong)

    watch(currentSong, async(newSong) => {
        if (!newSong.url || !newSong.id) {
            return
        }
        stopLyric()
        currentLyric.value = null
        currentLineNum.value = 0

        const lyric = await getLyric(newSong)
        store.commit('addSongLyric', {
            song: newSong,
            lyric
        })

        // 请求的时候切歌了
        // if (currentSong.value.lyric !== lyric) {
        //     return
        //  }

        currentLyric.value = new Lyric(lyric, handleLyric)
        if (songReady.value) {
            playLyric()
        }
    })

    function playLyric() {
        const currentLyricVal = currentLyric.value
        if (currentLyricVal) {
            currentLyricVal.seek(currentTime.value * 1000)
        }
    }

    function stopLyric() {
        const currentLyricVal = currentLyric.value
        if (currentLyricVal) {
            currentLyricVal.stop()
        }
    }

    function handleLyric({ lineNum }) {
        currentLineNum.value = lineNum
        const scrollComp = lyricScrollRef.value // 组件
        const listEl = lyricListRef.value // dom
        if (!listEl) {
            return
        }
        if (lineNum > 5) { // 保证高亮部分始终在中间
            const lineEl = listEl.children[lineNum - 5] // -5的原因是让它滚动的位置靠中间
            scrollComp.scroll.scrollToElement(lineEl, 1000)
        } else {
            scrollComp.scroll.scrollTo(0, 0, 1000)
        }
    }

    return {
        currentLyric,
        currentLineNum,
        lyricScrollRef,
        lyricListRef,
        playLyric,
        stopLyric
    }
}