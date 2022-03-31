import storage from 'good-storage'

function insertArray(arr, val, compare, maxLen) {
    const index = arr.findIndex(compare) // 不可直接用indexOf 因为不同歌曲的id可能是一样的
    if (index > -1) { // 已存在
        return
    }
    arr.unshift(val) // 插入最前面
    if (maxLen && arr.length > maxLen) {
        arr.pop() // 把最开始保存的那首给移出去
    }
}

function deletFromArray(arr, compare) {
    const index = arr.findIndex(compare)
    if (index > -1) {
        arr.splice(index, 1)
    }
}

export function save(item, key, compare, maxLen) {
    const items = storage.get(key, [])
    insertArray(items, item, compare, maxLen)
    storage.set(key, items)
    return items
}

export function remove(key, compare) {
    const items = storage.get(key, [])
    deletFromArray(items, compare)
    storage.set(key, items)
    return items
}

export function load(key) {
    return storage.get(key)
}