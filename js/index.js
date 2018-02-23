// 获取元素
let getEl = (selector) => {
    return document.querySelector(selector);
}

let getAllEls = (selector) => {
    return document.querySelectorAll(selector);
}

// 获取元素样式
let getCls = (element) => {
    return element.getAttribute('class');
}

// 设置元素样式
let setCls = (element, cls) => {
    return element.setAttribute('class', cls);
}

// 为元素添加样式
let addCls = (element, cls) => {
    let baseCls = getCls(element);
    if (baseCls.indexOf(cls) === -1) {
        setCls(element, baseCls + ' ' + cls);
    }
}

// 为元素删除样式
let delCls = (element, cls) => {
    let baseCls = getCls(element);
    if (baseCls.indexOf(cls) !== -1) {
        setCls(element, baseCls.split(cls).join(' ').replace(/\s+/g, ' '));
    }
}

// 1.页面载入完成,所有动画元素初始化样式_animate_init

let screenAnimateElements = {
    '.screen-1': [
        '.screen-1__heading',
        '.screen-1__phone',
        '.screen-1__shadow'
    ],

    '.screen-2': [
        '.screen-2__heading',
        '.screen-2__subHeading',
        '.screen-2__phone',
        '.screen-2__point',
        '.screen-2__point_i_1',
        '.screen-2__point_i_2',
        '.screen-2__point_i_3'
    ],

    '.screen-3': [
        '.screen-3__heading',
        '.screen-3__subHeading',
        '.screen-3__phone',
        '.screen-3__features',
        '.screen-3__features__item'
    ],

    '.screen-4': [
        '.screen-4__heading',
        '.screen-4__subHeading',
        '.screen-4__type-item_i_1',
        '.screen-4__type-item_i_2',
        '.screen-4__type-item_i_3',
        '.screen-4__type-item_i_4'
    ],

    '.screen-5': [
        '.screen-5__heading',
        '.screen-5__subHeading',
        '.screen-5__bg'
    ]
};

// 设置屏内元素为初始状态
let setScreenAnimateInit = (screenSelector) => {
    // 获取当前屏的元素
    let screen = getEl(screenSelector);
    // 需要设置动画的元素
    let animateElements = screenAnimateElements[screenSelector];

    animateElements.forEach((item) => {
        let el = getEl(item);
        let baseCls = getCls(el);
        setCls(el, `${baseCls} ${item.substr(1)}_animate_init`);
    })
}

window.onload = () => {
    for (const key in screenAnimateElements) {
        if (key === '.screen-1') {
            continue;
        }
        setScreenAnimateInit(key);
    }
}

// 2.页面滚动到哪个屏幕, 哪个屏幕就播放动画 & 导航条、大纲的出现.

// 设置播放屏内的元素动画
let playScreenAnimateDone = (screenSelector) => {
    let screen = getEl(screenSelector);
    let animateElements = screenAnimateElements[screenSelector];

    animateElements.forEach((item) => {
        let el = getEl(item);
        let baseCls = getCls(el);
        setCls(el, baseCls.replace('_animate_init', '_animate_done'));
    })
}

let navItems = getAllEls('.header__nav-item');
let outlineItems = getAllEls('.outline__item');
let navTip = getEl('.header__nav-tip');

let switchNavItemsActive = (idx) => {

    navItems.forEach((item) => {
        delCls(item, 'header__nav-item_status_active');
    })

    addCls(navItems[idx], 'header__nav-item_status_active');

    outlineItems.forEach((item) => {
        delCls(item, 'outline__item_status_active');
    })

    addCls(outlineItems[idx], 'outline__item_status_active');

    navTip.style.left = (idx * 100) + 'px';
}

switchNavItemsActive(0);
window.onscroll = () => {
    let top = document.documentElement.scrollTop;

    if (top > 60) {
        addCls(getEl('.header'), 'header_status_black');
        addCls(getEl('.outline'), 'outline_status_in');
    } else {
        delCls(getEl('.header'), 'header_status_black');
        delCls(getEl('.outline'), 'outline_status_in');
        switchNavItemsActive(0);
    }

    if (top === document.documentElement.scrollHeight) {
        return;
    }

    if (top > 800 * 1 - 100) {
        playScreenAnimateDone('.screen-2');
        switchNavItemsActive(1);
    }

    if (top > 800 * 2 - 100) {
        playScreenAnimateDone('.screen-3');
        switchNavItemsActive(2);
    }

    if (top > 800 * 3 - 100) {
        playScreenAnimateDone('.screen-4');
        switchNavItemsActive(3);
    }

    if (top > 800 * 4 - 100) {
        playScreenAnimateDone('.screen-5');
        switchNavItemsActive(4);
    }
}

// 3.导航条、大纲双向定位.

let setNavJump = (item, index) => {
    item.addEventListener('click', () => {
        if (index !== navItems.length - 1) {
            document.documentElement.scrollTop = index * 800;
        } else {
            document.documentElement.scrollTop = document.documentElement.scrollHeight;
        }
    });
}

navItems.forEach((item, index) => {
    setNavJump(item, index);
})

outlineItems.forEach((item, index) => {
    setNavJump(item, index);
})

/* 滑动门特效 */

let setTip = (item, index) => {
    if (index === navItems.length - 1) {
        return;
    }
    item.addEventListener('mouseover', () => {
        // margin 要改成 padding
        navTip.style.left = (index * 100) + 'px';
    })

    let activeIndex = 0;

    item.addEventListener('mouseout', () => {
        navItems.forEach((item, i) => {
            if (getCls(item).indexOf('header__nav-item_status_active') !== -1) {
                activeIndex = i;
            }
        })
        navTip.style.left = (activeIndex * 100) + 'px';
    })
}

navItems.forEach((item, index) => {
    setTip(navItems[index], index);
})

setTimeout(() => {
    playScreenAnimateDone('.screen-1');
}, 200);
