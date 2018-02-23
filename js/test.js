var screenAnimateElements = {
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

function setScreenAnimate(screenSelector) {
    // 获取当前屏的元素
    var screen = document.querySelector(screenSelector);
    // 需要设置动画的元素
    var animateElements = screenAnimateElements[screenSelector];

    var isInit = false;
    var isAnimateDone = false;

    screen.addEventListener('click', () => {
        animateElements.forEach((item) => {
            var el = document.querySelector(item);
            var baseCls = el.getAttribute('class');

            // if (!isInit) {
            //     !isAnimateDone && (baseCls = `${baseCls} ${item.substr(1)}_animate_init`);
            //     baseCls = baseCls.replace('_animate_done', '_animate_init');
            //     el.setAttribute('class', baseCls);
            // } else {
            //     baseCls = baseCls.replace('_animate_init', '_animate_done');
            //     el.setAttribute('class', baseCls.replace('_animate_init', '_animate_done'));
            // }

            if (!isAnimateDone && !isInit) {
                baseCls = `${baseCls} ${item.substr(1)}_animate_init`;
            } 
            el.setAttribute('class', isInit ? baseCls.replace('_animate_init', '_animate_done') : baseCls.replace('_animate_done', '_animate_init'));
        })
        isInit = !isInit;
        isAnimateDone = true;
        return;
    })
}

for (const key in screenAnimateElements) {
    setScreenAnimate(key);
}