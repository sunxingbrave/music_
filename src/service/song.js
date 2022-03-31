import {get } from './base'

export function processSongs(songs) {
    if (!songs.length) {
        return Promise.resolve(songs) // 没有歌曲的时候
    }

    return get('/api/getSongsUrl', {
        mid: songs.map((song) => {
            return song.mid
        })
    }).then((result) => {
        const map = result.map // 歌手的mid:歌曲的url
            // console.log(result)
        return songs.map((song) => {
            song.url = map[song.mid] // ?
            return song
        }).filter((song) => { // url有vkey歌曲才可以听
            return song.url.indexOf('vkey') > -1
        })
    })
}

const lyricMap = {}

export function getLyric(song) {
    if (song.lyric) {
        return Promise.resolve(song.lyric)
    }

    const mid = song.mid
    const lyric = lyricMap[mid]
    if (lyric) {
        return Promise.resolve(song.lyric)
    }

    return get('/api/getLyric', {
        mid
    }).then((result) => {
        const lyric = result ? result.lyric : '[00:00:00]该歌曲暂时无法获取歌词'
        lyricMap[mid] = lyric
        return lyric
    })
}