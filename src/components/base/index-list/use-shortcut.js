import { ref, computed } from 'vue'

export default function useShortcut(props, groupRef) {
    const ANCHOR_HEIGHT = 18
    const scrollRef = ref(null)

    const shortcutList = computed(() => {
        return props.data.map((group) => {
            return group.title
        })
    })

    const touch = {}

    function onShortcutTouchStart(e) {
        // console.log(e.target) // <li></li>
        // console.log(e.target.dataset)
        const anchorIndex = parseInt(e.target.dataset.index)
        touch.y1 = e.touches[0].pageY
        touch.anchorIndex = anchorIndex
            // console.log(touch)
        scrollTo(anchorIndex)
    }

    function onShortTouchMove(e) {
        touch.y2 = e.touches[0].pageY
        const delta = (touch.y2 - touch.y1) / ANCHOR_HEIGHT | 0
            // console.log(touch)
            // console.log(delta)
        const anchorIndex = touch.anchorIndex + delta

        scrollTo(anchorIndex)
    }

    function scrollTo(index) {
        if (isNaN(index)) { // 防止在class='shortcut'那个div上报错
            return
        }
        index = Math.max(0, Math.min(shortcutList.value.length - 1, index)) // 限制只能在index-list上滑动
        const targetEl = groupRef.value.children[index]
        const scroll = scrollRef.value.scroll
        scroll.scrollToElement(targetEl, 0)
    }

    return { shortcutList, onShortcutTouchStart, scrollRef, onShortTouchMove }
}