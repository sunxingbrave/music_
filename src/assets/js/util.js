export function shuffle(source) {
    console.log('----------------')
    console.log(source)
    console.log('----------------')
    const arr = source.slice() // 因为后面的arr会变 所以为了不改变source 就得这样做
    for (let i = 0; i < arr.length; i++) {
        const j = getRandomInt(i)
        swap(arr, i, j)
    }
    return arr
}

function getRandomInt(max) {
    return Math.floor(Math.random() * (max + 1)) // Math.random()从0到1但不包括1
}

function swap(arr, i, j) {
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
}

export function formatTime(interval) {
    interval = interval | 0 // 向下取整
    const minute = ((interval / 60 | 0) + '').padStart(2, '0')
    const second = (interval % 60 + '').padStart(2, '0')
    return `${minute}:${second}`
}