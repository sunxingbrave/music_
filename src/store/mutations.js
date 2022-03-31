const mutations = {
    setPlayState(state, playing) {
        state.playing = playing
    },
    setSequenceList(state, list) {
        state.setSequenceList = list
    },
    setPlaylist(state, list) {
        state.playlist = list
    },
    setPlayMode(state, mode) {
        state.setPlayMode = mode
    },
    setCurrentIndex(state, index) {
        state.setCurrentIndex = index
    },
    setFullScreen(state, fullScreen) {
        state.fullScreen = fullScreen
    },
    setFavoriteList(state, list) {
        state.favoriteList = list
    },
    addSongLyric(state, { song, lyric }) {
        state.sequenceList.map((item) => {
            if (item.mid === song.mid) {
                item.lyric = lyric
            }
            return item
        })
    }
}

export default mutations