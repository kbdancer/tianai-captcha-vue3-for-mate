// ===================== 工具类 =======================
// base64
let Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function (e) {
        let t = "";
        let n, r, i, s, o, u, a;
        let f = 0;
        e = Base64._utf8_encode(e);
        while (f < e.length) {
            n = e.charCodeAt(f++);
            r = e.charCodeAt(f++);
            i = e.charCodeAt(f++);
            s = n >> 2;
            o = (n & 3) << 4 | r >> 4;
            u = (r & 15) << 2 | i >> 6;
            a = i & 63;
            if (isNaN(r)) {
                u = a = 64
            } else if (isNaN(i)) {
                a = 64
            }
            t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
        }
        return t
    },
    decode: function (e) {
        let t = "";
        let n, r, i;
        let s, o, u, a;
        let f = 0;
        e = e.replace(/[^A-Za-z0-9+/=]/g, "");
        while (f < e.length) {
            s = this._keyStr.indexOf(e.charAt(f++));
            o = this._keyStr.indexOf(e.charAt(f++));
            u = this._keyStr.indexOf(e.charAt(f++));
            a = this._keyStr.indexOf(e.charAt(f++));
            n = s << 2 | o >> 4;
            r = (o & 15) << 4 | u >> 2;
            i = (u & 3) << 6 | a;
            t = t + String.fromCharCode(n);
            if (u !== 64) {
                t = t + String.fromCharCode(r)
            }
            if (a !== 64) {
                t = t + String.fromCharCode(i)
            }
        }
        t = Base64._utf8_decode(t);
        return t
    },
    _utf8_encode: function (e) {
        e = e.replace(/rn/g, "n");
        let t = "";
        for (let n = 0; n < e.length; n++) {
            let r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r)
            } else if (r > 127 && r < 2048) {
                t += String.fromCharCode(r >> 6 | 192);
                t += String.fromCharCode(r & 63 | 128)
            } else {
                t += String.fromCharCode(r >> 12 | 224);
                t += String.fromCharCode(r >> 6 & 63 | 128);
                t += String.fromCharCode(r & 63 | 128)
            }
        }
        return t
    },
    _utf8_decode: function (e) {
        let t = "";
        let n = 0;
        let r = 0;
        let c1 = 0;
        let c2 = 0;
        let c3 = 0;
        while (n < e.length) {
            r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
                n++
            } else if (r > 191 && r < 224) {
                c2 = e.charCodeAt(n + 1);
                t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                n += 2
            } else {
                c2 = e.charCodeAt(n + 1);
                c3 = e.charCodeAt(n + 2);
                t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                n += 3
            }
        }
        return t
    }
}

/**
 * 清除默认事件
 * @param event event
 */
function clearPreventDefault(event) {
    if (event.preventDefault) {
        event.preventDefault();
    }
}

/**
 * 阻止某div默认事件
 * @param $div
 */
function clearAllPreventDefault($div) {
    $div.each(function (index, el) {
        el.addEventListener('touchmove', clearPreventDefault, {passive: false});
    });
}

function reductionAllPreventDefault($div) {
    $div.each(function (index, el) {
        el.removeEventListener('touchmove', clearPreventDefault);
    });
}

/** 是否打印日志 */
let isPrintLog = false;

/** 滑块验证码. */
let sliderCaptchaDivTemplate = `
<div id="tianai-captcha" class="tianai-captcha-slider">
    <div id="tianai-captcha-bg-img"></div>
    <div class="slider-tip">
        <span id="tianai-captcha-slider-move-track-font">拖动滑块完成拼图</span>
    </div>
    <div class="content">
        <div class="bg-img-div">
            <img id="tianai-captcha-slider-bg-img" src="" alt/>
            <canvas id="tianai-captcha-slider-bg-canvas"></canvas>
        </div>
        <div class="slider-img-div" id="tianai-captcha-slider-img-div">
            <img id="tianai-captcha-slider-move-img" src="" alt/>
        </div>
        <div class="tianai-captcha-tips" id="tianai-captcha-tips">验证失败，请重新尝试</div>
    </div>
    <div class="slider-move">
        <div class="slider-move-track">
            <div id="tianai-captcha-slider-move-track-mask"></div>
            <div class="slider-move-shadow"></div>
        </div>
        <div class="slider-move-btn" id="tianai-captcha-slider-move-btn">
        </div>
    </div>
    <div class="slider-bottom">
        <img class="logo" src="../images/logo.png" id="tianai-captcha-logo" alt=""/>
<!--        <div class="close-btn" id="tianai-captcha-slider-close-btn"></div>-->
        <div class="refresh-btn" id="tianai-captcha-slider-refresh-btn"></div>
    </div>
</div>
`;
/** 当前验证码 */
let currentCaptcha;

function printLog(params) {
    if (isPrintLog) {
        console.log(JSON.stringify(params));
    }
}

function wrapCaptchaConfig(captchaConfig) {
    // 判断有没有生成验证码的方法， 没有使用默认的
    if (!captchaConfig.genCaptchaFun) {
        captchaConfig.genCaptchaFun = (param, context) => {
            return new Promise((resolve) => {
                $.get(captchaConfig.genCaptchaUrl, param, function (data) {
                    let convertData = data;
                    if (typeof(convertData) == "string") {
                        try {
                            convertData = JSON.parse(data);
                        } catch (e) {
                            // ignore
                        }
                    }
                    return resolve(convertData);
                })
            })
        }
    }
    // 判断有没有校验验证码的方法， 没有使用默认的
    if (!captchaConfig.validCaptchaFun) {
        captchaConfig.validCaptchaFun = (data, currentCaptchaData, context) => {
            const currentCaptchaId = currentCaptchaData.currentCaptchaId
            const encData = Base64.encode(JSON.stringify(data));
            return new Promise(((resolve, reject) => {
                localStorage.setItem("currentCaptchaId", currentCaptchaId);
                $.post(captchaConfig.validUrl, {
                    id: currentCaptchaId,
                    data: encData
                }, function (res) {
                    if (res.code === 200) {
                        const useTimes = (data.endSlidingTime - data.startSlidingTime) / 1000;
                        showTips(context.el, `验证成功,耗时${useTimes}秒`, 1, () => {
                            resolve(res);
                        });
                    } else {
                        let tipMsg = "验证失败，请重新尝试!";
                        if (res.code) {
                            switch (res.code) {
                                case 4001:
                                    tipMsg = "验证失败，请重新尝试!";
                                    break;
                                default:
                                    tipMsg = "验证码被黑洞吸走了！"
                                    break;
                            }
                        }
                        showTips(context.el, tipMsg, 0, () => {
                            reject(res);
                        });
                    }
                })
            }))
        }
    }
    if (!captchaConfig.validSuccessCallback) {
        captchaConfig.validSuccessCallback = () => {
            alert("验证成功，在配置项中重写 [validSuccessCallback] 方法，用于支持自定义逻辑")
        }
    }

    return captchaConfig;
}

/**
 * 创建滑动验证码
 * @param divId 绑定的div的id
 * @param captchaConfig 验证码相关配置
 * @param styleConfig 样式相关配置
 * @returns {{el: (*|jQuery|HTMLElement), styleConfig, currentCaptchaData: {}, loadCaptcha: loadCaptcha, type: string, showWindow: showWindow, loadWindow: loadWindow, valid: valid, hideWindow: hideWindow, successCallback: successCallback, reset: reset, loadCaptchaForData: loadCaptchaForData, divId, captchaConfig}}
 */
function createSliderCaptcha(divId, captchaConfig, styleConfig) {
    captchaConfig = wrapCaptchaConfig(captchaConfig);
    return {
        type: "slider",
        divId: divId,
        el: $(divId),
        styleConfig: styleConfig,
        captchaConfig: captchaConfig,
        currentCaptchaData: {},
        loadWindow: function () {
            let sliderImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAABkCAYAAABU19jRAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAASFSURBVHgB7d1NbBRlGMDx551tbYWWlvqRkkpTEzCRpKExoRcxoQfjAQw9ezH1hieP3iwnOOpFj3jqGaMeOBhIxIsHLTGRS01LOYAxqYsiH7bd13mmrW6Xnd15XGaHd/j/ks2ys50uyfxn5h3mpXXSYPjyhROyKbM+cqfFy4Tg6eNk0XtZjCJ/tjozt7L7rW1xKMM1cR+5mnwgwDYv8vF2OFV9nQSjsfhNuSLOHRWgUXzEcc7PaDSRvtYjC7EglZepWi1uJObio8uEr7llAdpwNT8TxQPceQGyqMhsFF8NcSpCJt6705GenwTIZiISwIBgYEIwMCEYmBAMTAgGJgQDE4KBCcHAhGBgQjAwIRiYEAxMCAYmBAMTgoEJwcCEYGBCMDAhGJgQDEwIBiYEAxOCgUmPIDfj/QPy6ZHX5fjwqKw+uCuf3bweP36WkBFMjr567a0kGqXP5w4fk6GeXjm/fE1CxSkpJ5MDI//GUu/Dl6fiR7j/nZ1gChByNASTk5/ursnV32+nvh9qNASTo/evf5cMdtOEGA3B5EhjOfXDpVJFQzA5K1s0BNMFZYqGYLqkLNEQTBeVIRqC6bLQoyGYAoQcDcEUJNRoCKZAIUZT6X93dl4C92xUkZf6BuRA3x6pOCd/bW5kWk+nHZw5+KocG3ox2Wh3Nv7OtN6Zg0fkvbFXZKi3L1nvYW1T/i/9zK9/uyknXxiP72Q/0/Rrju8fTZ6vVn+Vormhbz73ErDBSq9Mxxu8N/rvYLl074/4caflerrX6t5b79SPl1re/1HfTr+d3IneocG88f2XmWNLo3e266dDNJPl75e34E9Jk4PP7YpFHdqzT0bivT+NbpTGWJTOV2nlnQOHdsWy8730iNOpbKen4k9NwQezr6e36XI9TaWZHBxpvjyOIe20oPQU1nT5/lF5HLZm5aXPyGuMtQjBB3O/tpGyPH1csXq/+V7cbhyTtvenfT8rPYKcOzyd+v7CrV+kaMEHc+Peoxvrz411WVt/mLqOzlVZuLX0yPJ2G0T3/sZoNLDzy4vSqWZjqnr6uY/jczoV/KBXjfXtlbH+vcmf19YfyI14j1/3tbbr6djj5PPj21cqq7Jwe6ntOjvjH33eiUUD7ESWWNqNb7qlFMGELKRYFP9wV6DQYlEEU5AQY1EEU4BQY1EE02Uhx6IIpotCj0URTJeUIRZFMF1QllgUweSsTLEogslR2WJRBJMTvetdtlgUweSk1VSEUGNRBJMTvSHZbKpEyLEogsnJ1p3s3T9pKvRYFHerc6bTIHRqpwakc3A6nftbNIKBCackmBAMTAgGJgQDE4KBCcHAhGBgQjAwIRiYEAxMCAYmBAMTgoEJwcCEYGBCMDAhGJgQDEwIBiYEAxOCgQnBwIRgYBI5JysCZLMYH2H8FwJk4JNgNuWiABlEkT8bVd+cu+K8/0SAFrSR6szcytagtyLz4qT433yAJ5P315JGZPsqKS6n6pyf4UiDRtqEq8gJbSR53fgFw5cvTMTjmvn4+umo9zIleOokV861+GLIy0UdstS/9w99LhL5XEMddwAAAABJRU5ErkJggg==";
            let bgImg = "";
            let moveTrackMaskBorderColor = "#00f4ab";
            let moveTrackMaskBgColor = "#a9ffe5";
            let logoUrl = "images/logo.png"
            if (styleConfig) {
                sliderImg = styleConfig.btnUrl;
                bgImg = styleConfig.bgUrl;
                moveTrackMaskBgColor = styleConfig.moveTrackMaskBgColor;
                moveTrackMaskBorderColor = styleConfig.moveTrackMaskBorderColor;
                if (styleConfig.logoUrl) {
                    logoUrl = this.styleConfig.logoUrl;
                }
            }
            this.el.find("#tianai-captcha-logo").attr("src", logoUrl);
            this.el.find("#tianai-captcha-bg-img").css("background-image", "url(" + bgImg + ")");
            this.el.find(".slider-move .slider-move-btn").css("background-image", "url(" + sliderImg + ")");
            this.el.find("#tianai-captcha-slider-move-track-mask").css("border-color", moveTrackMaskBorderColor);
            this.el.find("#tianai-captcha-slider-move-track-mask").css("background-color", moveTrackMaskBgColor);
        },
        destroyWindow: function () {
            this.hideWindow();
            const existsCaptchaEl = this.el.children("#tianai-captcha");
            if (existsCaptchaEl) {
                existsCaptchaEl.remove();
            }
        },
        showWindow: function () {
            showSliderWindow(this.el);
        },
        hideWindow: function () {
            this.reset();
            hideSliderWindow(this.el);
        },
        loadCaptcha: function () {
            const that = this;
            that.showWindow();
            this.captchaConfig.genCaptchaFun({}, this).then(data => {
                that.loadCaptchaForData(that, data);
            })
        },
        loadCaptchaForData: function (that, data) {
            that.showWindow();
            that.reset();
            const bgImg = that.el.find("#tianai-captcha-slider-bg-img");
            const sliderImg = that.el.find("#tianai-captcha-slider-move-img");
            bgImg.attr("src", data.captcha.backgroundImage);
            sliderImg.attr("src", data.captcha.templateImage);
            bgImg.load(() => {
                that.currentCaptchaData = initConfig(bgImg.width(), bgImg.height(), sliderImg.width(), sliderImg.height(), 295 - 63 + 5);
                that.currentCaptchaData.currentCaptchaId = data.id;
                // 重组
                drawBgImage(data.captcha, "tianai-captcha-slider-bg-canvas", "tianai-captcha-slider-bg-img", 50);
            });
        },
        reset: function () {
            this.el.find("#tianai-captcha-slider-move-btn").css("transform", "translate(0px, 0px)")
            this.el.find("#tianai-captcha-slider-img-div").css("transform", "translate(0px, 0px)")
            this.el.find("#tianai-captcha-slider-move-track-mask").css("width", 0)
            const bgImg = this.el.find("#tianai-captcha-slider-bg-img");
            const sliderImg = this.el.find("#tianai-captcha-slider-move-img");
            bgImg.attr("src", "");
            sliderImg.attr("src", "");
            this.currentCaptchaData.currentCaptchaId = null;
        },
        valid: function () {
            const that = this;
            const currentCaptchaData = this.currentCaptchaData;
            const data = {
                bgImageWidth: currentCaptchaData.bgImageWidth,
                bgImageHeight: currentCaptchaData.bgImageHeight,
                sliderImageWidth: currentCaptchaData.sliderImageWidth,
                sliderImageHeight: currentCaptchaData.sliderImageHeight,
                startSlidingTime: currentCaptchaData.startTime,
                endSlidingTime: currentCaptchaData.stopTime,
                trackList: currentCaptchaData.trackArr
            };
            this.captchaConfig.validCaptchaFun(data, this.currentCaptchaData, this).then(res => {
                that.captchaConfig.validSuccessCallback(res, that);
            }).catch(res => {
                that.loadCaptcha();
            });
        }
    }
}

function closeTips(el, callback) {
    const tipEl = $(el.find("#tianai-captcha-tips"));
    tipEl.removeClass("tianai-captcha-tips-on")
    tipEl.removeClass("tianai-captcha-tips-success")
    tipEl.removeClass("tianai-captcha-tips-error")
    // 延时
    setTimeout(callback, .35);
}

function showTips(el, msg, type, callback) {
    const tipEl = $(el.find("#tianai-captcha-tips"));
    tipEl.text(msg);
    if (type === 1) {
        // 成功
        tipEl.removeClass("tianai-captcha-tips-error")
        tipEl.addClass("tianai-captcha-tips-success")
    } else {
        // 失败
        tipEl.removeClass("tianai-captcha-tips-success")
        tipEl.addClass("tianai-captcha-tips-error")
    }
    tipEl.addClass("tianai-captcha-tips-on");
    // 延时
    setTimeout(callback, 1000);
}

/**
 * 对于乱序背景图进行重组(暂时还有bug)
 * @param data 图片数据
 * @param canvasId canvas
 * @param imgId 对应的图片id
 * @param delay 延时
 */
function drawBgImage(data, canvasId, imgId, delay) {
    if (!data.data || !data.data.shuffle) {
        return;
    }
    let img = document.getElementById(imgId);
    if (img.width === 0 || img.height === 0) {
        setTimeout(function (){
            drawBgImage(data, canvasId, imgId, delay)
        }, 50);
    }

    let c = document.getElementById(canvasId);
    let ctx = c.getContext("2d");
    c.width = img.width;
    c.height = img.height;

    const shuffle = data.data.shuffle;
    const sourceImageWidth = data.backgroundImageWidth;
    const sourceImageHeight = data.backgroundImageHeight;
    const canvasImageWidth = c.width;
    const canvasImageHeight = c.height;
    const xNum = shuffle.x;
    const yNum = shuffle.y;
    const pos = shuffle.pos;

    const sourceBlockX = sourceImageWidth / xNum;
    const sourceBlockY = sourceImageHeight / yNum;
    const blockX = canvasImageWidth / xNum;
    const blockY = canvasImageHeight / yNum;
    const sourceImageBlocks = [];
    const imageBlocks = [];
    for (let i = 0; i < yNum; i++) {
        for (let o = 0; o < xNum; o++) {
            sourceImageBlocks.push({
                startX: Math.floor(o * sourceBlockX),
                startY: Math.floor(i * sourceBlockY)
            });
            imageBlocks.push({
                startX: Math.round(o * blockX),
                startY: Math.round(i * blockY)
            });
        }
    }
    const evalFuns = []
    for (let i = 0; i < pos.length; i++) {
        const p = pos[i]
        const sourceBlock = sourceImageBlocks[p];
        const block = imageBlocks[i];
        evalFuns.push(() => {
            ctx.drawImage(img, sourceBlock.startX, sourceBlock.startY, sourceBlockX, sourceBlockY, block.startX, block.startY, blockX, blockY);
        });
    }
    evalFuns.sort((a, b) => {
        return Math.random() > .5 ? -1 : 1;
    });
    for (let i = 0; i < evalFuns.length; i++) {
        let fun = evalFuns[i]
        if (delay > 0) {
            setTimeout(fun, (i + 1) * delay);
        } else {
            fun();
        }
    }
}
/**
 * 初始化滑动拼图验证码
 * @param divId 绑定的div
 * @param captchaConfig 验证码配置
 * @param styleConfig 样式配置
 * @returns {{el: (*|jQuery|HTMLElement), styleConfig, currentCaptchaData: {}, loadCaptcha: loadCaptcha, type: string, showWindow: showWindow, loadWindow: loadWindow, valid: valid, hideWindow: hideWindow, successCallback: successCallback, reset: reset, loadCaptchaForData: loadCaptchaForData, divId, captchaConfig}}
 */
function initSliderCaptcha(divId, captchaConfig, styleConfig) {
    const captcha = createSliderCaptcha(divId, captchaConfig, styleConfig);
    // 全局
    currentCaptcha = captcha;
    // 隐藏窗口
    // captcha.hideWindow();
    // 载入div块
    const existsCaptchaEl = captcha.el.children("#tianai-captcha");
    if (existsCaptchaEl) {
        existsCaptchaEl.remove();
    }
    captcha.el.append(sliderCaptchaDivTemplate);
    // 加载样式
    captcha.loadWindow();
    // 滑动按钮绑定事件
    captcha.el.find("#tianai-captcha-slider-move-btn").mousedown(down);
    captcha.el.find("#tianai-captcha-slider-move-btn").on("touchstart", down);
    // 刷新按钮绑定样式
    captcha.el.find("#tianai-captcha-slider-refresh-btn").click(function () {
        captcha.loadCaptcha();
    })
    // captcha.el.find("#tianai-captcha-slider-close-btn").click(function () {
    //     captcha.destroyWindow();
    // });
    clearAllPreventDefault(captcha.el);
    return captcha;
}

/**
 * 根据验证码类型生成对应的验证码样式
 * @param divId divId
 * @param captchaConfig 验证码配置
 * @param styleConfig 样式配置
 * @returns {{el: (*|jQuery|HTMLElement), styleConfig, currentCaptchaData: {}, loadCaptcha: loadCaptcha, type: string, showWindow: showWindow, loadWindow: loadWindow, valid: valid, hideWindow: hideWindow, successCallback: successCallback, reset: reset, loadCaptchaForData: loadCaptchaForData, divId, captchaConfig}}
 */
function initRandomCaptcha(divId, captchaConfig, styleConfig) {
    let captcha = createSliderCaptcha(divId, captchaConfig, styleConfig);
    captcha.loadCaptcha = function () {
        const that = this;
        that.showWindow();
        this.captchaConfig.genCaptchaFun({}, this).then(data => {
            let newCaptcha;
            newCaptcha = initSliderCaptcha(that.divId, that.captchaConfig, that.styleConfig);
            newCaptcha.loadCaptchaForData(newCaptcha, data);
            newCaptcha.hideWindow = captcha.hideWindow;
            newCaptcha.showWindow = captcha.showWindow;
            newCaptcha.destroyWindow = captcha.destroyWindow;
            newCaptcha.loadCaptcha = captcha.loadCaptcha;
        })
    }
    // 全局
    return captcha;
}

function initConfig(bgImageWidth, bgImageHeight, sliderImageWidth, sliderImageHeight, end) {
    const currentCaptchaConfig = {
        startTime: new Date(),
        trackArr: [],
        movePercent: 0,
        clickCount: 0,
        bgImageWidth: bgImageWidth,
        bgImageHeight: bgImageHeight,
        sliderImageWidth: sliderImageWidth,
        sliderImageHeight: sliderImageHeight,
        end: end
    }
    printLog(["init", currentCaptchaConfig]);
    return currentCaptchaConfig;
}

function down(event) {
    const coordinate = getCurrentCoordinate(event);
    let startX = coordinate.x;
    let startY = coordinate.y;
    currentCaptcha.currentCaptchaData.startX = startX;
    currentCaptcha.currentCaptchaData.startY = startY;

    const pageX = currentCaptcha.currentCaptchaData.startX;
    const pageY = currentCaptcha.currentCaptchaData.startY;
    const startTime = currentCaptcha.currentCaptchaData.startTime;
    const trackArr = currentCaptcha.currentCaptchaData.trackArr;
    trackArr.push({
        x: pageX - startX,
        y: pageY - startY,
        type: "down",
        t: (new Date().getTime() - startTime.getTime())
    });
    printLog(["start", startX, startY])
    // pc
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    // 手机端
    window.addEventListener("touchmove", move, false);
    window.addEventListener("touchend", up, false);
    doDown();
}

function doDown() {
    if (currentCaptcha.type === 'rotate_degree') {
        currentCaptcha.el.find(".tianai-captcha-slider-bg-img-mask").css("display", "block")
    }
}


function move(event) {
    if (event.touches && event.touches.length > 0) {
        event = event.touches[0];
    }
    const coordinate = getCurrentCoordinate(event);
    let pageX = coordinate.x;
    let pageY = coordinate.y;
    const startX = currentCaptcha.currentCaptchaData.startX;
    const startY = currentCaptcha.currentCaptchaData.startY;
    const startTime = currentCaptcha.currentCaptchaData.startTime;
    const end = currentCaptcha.currentCaptchaData.end;
    const bgImageWidth = currentCaptcha.currentCaptchaData.bgImageWidth;
    const trackArr = currentCaptcha.currentCaptchaData.trackArr;
    let moveX = pageX - startX;
    const track = {
        x: pageX - startX,
        y: pageY - startY,
        type: "move",
        t: (new Date().getTime() - startTime.getTime())
    };
    trackArr.push(track);
    if (moveX < 0) {
        moveX = 0;
    } else if (moveX > end) {
        moveX = end;
    }
    currentCaptcha.currentCaptchaData.moveX = moveX;
    currentCaptcha.currentCaptchaData.movePercent = moveX / bgImageWidth;
    doMove();
    printLog(["move", track])
}

function doMove() {
    const moveX = currentCaptcha.currentCaptchaData.moveX;
    if (currentCaptcha.type === 'slider') {
        // 滑动验证
        currentCaptcha.el.find("#tianai-captcha-slider-move-btn").css("transform", "translate(" + moveX + "px, 0px)")
        currentCaptcha.el.find("#tianai-captcha-slider-img-div").css("transform", "translate(" + moveX + "px, 0px)")
        currentCaptcha.el.find("#tianai-captcha-slider-move-track-mask").css("width", moveX + "px")
    }
}

function up(event) {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
    window.removeEventListener("touchmove", move);
    window.removeEventListener("touchend", up);
    const coordinate = getCurrentCoordinate(event);
    currentCaptcha.currentCaptchaData.stopTime = new Date();
    let pageX = coordinate.x;
    let pageY = coordinate.y;
    const startX = currentCaptcha.currentCaptchaData.startX;
    const startY = currentCaptcha.currentCaptchaData.startY;
    const startTime = currentCaptcha.currentCaptchaData.startTime;
    const trackArr = currentCaptcha.currentCaptchaData.trackArr;

    const track = {
        x: pageX - startX,
        y: pageY - startY,
        type: "up",
        t: (new Date().getTime() - startTime.getTime())
    }

    trackArr.push(track);
    printLog(["up", track])
    doUp();
    currentCaptcha.valid();
}

function doUp() {
    if (currentCaptcha.type === 'rotate_degree') {
        currentCaptcha.el.find(".tianai-captcha-slider-bg-img-mask").css("display", "none")
    }
}


/**
 * 获取当前坐标
 * @param event 事件
 * @returns {{x: number, y: number}}
 */
function getCurrentCoordinate(event) {
    let startX, startY;
    if (event.pageX) {
        startX = event.pageX;
        startY = event.pageY;
    }
    let targetTouches;
    if (event.changedTouches) {
        // 抬起事件
        targetTouches = event.changedTouches;
    } else if (event.targetTouches) {
        // pc 按下事件
        targetTouches = event.targetTouches;
    } else if (event.originalEvent && event.originalEvent.targetTouches) {
        // 鼠标触摸事件
        targetTouches = event.originalEvent.targetTouches;
    }
    if (!startX && targetTouches[0].pageX) {
        startX = targetTouches[0].pageX;
        startY = targetTouches[0].pageY;
    }
    if (!startX && targetTouches[0].clientX) {
        startX = targetTouches[0].clientX;
        startY = targetTouches[0].clientY;
    }
    if (startX && startY) {
        startX = Math.round(startX);
        startY = Math.round(startY);
    }
    return {
        x: startX,
        y: startY
    }
}


function showSliderWindow(el) {
    el.css("display", "block")
}

function hideSliderWindow(el) {
    el.css("display", "none")
}

// 导出（使用模块化引用时需要导出对应的方法）
export { initRandomCaptcha };
