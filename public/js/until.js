
function cutString(s_text, s_start, s_end, i_start = 0) {
    i_start = s_text.indexOf(s_start, i_start);
    if (i_start === -1) return '';
    i_start += s_start.length;
    i_end = s_text.indexOf(s_end, i_start);
    if (i_end === -1) return '';
    return s_text.substr(i_start, i_end - i_start);
}


function local_readFile(file, def = {}){
    var content = nodejs.files.read(file, false);
    return content ? JSON.parse(content) : def;
}

function local_saveFile(file, def = '{}'){
    return nodejs.files.write(file, JSON.stringify(def));
}

function playSound(src){
    $('#soundTip').attr('src', src)[0].play();
}

 function triggerEvent(type, data, callback) {
    // console.log(type, data);
    g_plugin.callEvent(type, data, callback);
}

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function hasChinese(str) {
    return /[\u4E00-\u9FA5]+/g.test(str)
}

function inputFocus(ele) {
    ele.blur();
    ele.focus();
    var len = ele.value.length;
    if (document.selection) {
        var sel = ele.createTextRange();
        sel.moveStart('character', len);
        sel.collapse();
        sel.select();
    } else {
        ele.selectionStart = ele.selectionEnd = len;
    }
}

function parseFile(input) {
    var reader = new FileReader();
    reader.readAsText(input.files[0]);
    reader.onload = function(e) {
        try {
            json = JSON.parse(this.result);
            importData(json);
        } catch (err) {
            alert('错误的json数据!');
        }
    }
}

function renderSize(value) {
    if (null == value || value == '') {
        return "0 Bytes";
    }
    var unitArr = new Array("Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB");
    var index = 0;
    var srcsize = parseFloat(value);
    index = Math.floor(Math.log(srcsize) / Math.log(1024));
    var size = srcsize / Math.pow(1024, index);
    size = size.toFixed(2); //保留的小数位数
    return size + unitArr[index];
}

function importData(data, b_confirm = true) {
    var fun = (b = true) => {
        for (var key in data) {
            if (b) {
                s = data[key];
            } else {
                var old = JSON.parse(localStorage.getItem(key)) || {};
                s = JSON.stringify(Object.assign(old, JSON.parse(data[key])));
            }
            localStorage.setItem(key, s);
        }
        location.reload();
    }
    if (b_confirm) {
        confirm('<b>是否完全覆盖数据?</b>', {
            title: '导入数据',
            callback: (id) => {
                var b = id == 'ok';
                if (b) {
                    local_clearAll();
                }
                fun(b);
                return true;
            }
        });
    } else {
        fun();
    }
}

function copyObj(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function setHeight(selector, pb = '200px') {
    if (typeof(selector) == 'string') selector = $(selector);
    selector.css({
        'height': 'calc(100vh - ' + selector.offset().top + 'px)',
        paddingBottom: pb,
    });
}

function downloadData(blob, fileName) {
    if (typeof(blob) != 'blob') {
        blob = new Blob([blob]);
    }
    var eleLink = document.createElement('a');
    eleLink.download = fileName;
    eleLink.style.display = 'none';
    eleLink.href = URL.createObjectURL(blob);
    document.body.appendChild(eleLink);
    eleLink.click();
    document.body.removeChild(eleLink);
}


var g_actions = {};

function registerAction(name, callback) {
    if (!Array.isArray(name)) name = [name];
    for (var alisa of name) g_actions[alisa] = callback;
}

Date.prototype.format = function(fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

function popString(s, split) {
    return s.split(split).pop();
}

function getImgBase64(video, width, height) {
    return new Promise(function(resolve, reject) {
        var canvas = document.createElement("canvas");
        canvas.width = video.width();
        canvas.height = video.height();
        canvas.getContext("2d").drawImage(video[0], 0, 0, width, height); //绘制canvas
        dataURL = canvas.toDataURL('image/jpeg'); //转换为base64
        resolve(dataURL);
    });
}

function loadRes(files, callback, cache = true) {
    var i = 0;
    const onProgress = () => {
        if (++i == files.length) {
            callback && callback(i);
        }
    }
    for (var file of files) {
        if (file.type == "js") {
            if (cache && $('script[src="' + file.url + '"]').length) { // js已加载
                onProgress();
                continue;
            }
            var fileref = document.createElement('script');
            fileref.setAttribute("type", "text/javascript");
            fileref.setAttribute("src", file.url)
        } else if (file.type == "css" || file.type == "cssText") {
            if (cache && $('link[href="' + file.url + '"]').length) { // css已加载
                onProgress();
                continue;
            }
            var fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", file.url)
        }
        document.getElementsByTagName("head")[0].appendChild(fileref).onload = () => onProgress()
    }
}


function unescapeHTML(a) {
    a = "" + a;
    return a.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

function clearEventBubble(evt) {

    if (evt.stopPropagation) evt.stopPropagation();
    else evt.cancelBubble = true;
    if (evt.preventDefault) evt.preventDefault();
    else evt.returnValue = false
}


function isEmpty(s) {
    return typeof(s) != 'string' || !s.length;
}

function local_saveJson(key, data) {
    if (window.localStorage) {
        key = g_localKey + key;
        data = JSON.stringify(data);
        if (data == undefined) data = '[]';
        return localStorage.setItem(key, data);
    }
    return false;
}

function local_readJson(key, defaul) {
    if (!window.localStorage) return defaul;
    key = g_localKey + key;
    var r = JSON.parse(localStorage.getItem(key));
    return r === null ? defaul : r;
}

function local_getList() {
    var res = [];
    for (k of Object.keys(localStorage)) {
        if (k.indexOf(g_localKey) == 0) {
            res.push(k);
        }
    }
    return res;
}

function local_clearAll() {
    for (var key of local_getList()) {
        localStorage.removeItem(key);
    }
}

function copyText(text, input) {
    var remove;
    if (!input){
        remove = true;
        input = $('<input value="' + text + '" hidden>').appendTo('body')[0];
    }
    input.select();
    if (document.execCommand('copy')) {
        document.execCommand('copy');
    }
    remove && input.remove();
}

function showCopy(s) {
    prompt(s, {
        id: 'modal_copy',
        title: '复制文本',
        btns: [{
            id: 'copy',
            text: '复制',
            class: 'btn-primary',
        }],
        onBtnClick: (config, btn) => {
            if (btn.id == 'btn_copy') {
                copyText(s, $('#modal_copy textarea')[0]);
                toast('复制成功', 'alert-success');
                return false;
            }
        }
    })
}

function getTime(s, sh = _l(':'), sm = _l(':'), ss = _l(''), hour = false, msFixed = 2) {
    s = Number(s);
    if (s < 0) return '';
    var h = 0,
        m = 0;
    if (s >= 3600) {
        h = parseInt(s / 3600);
        s %= 3600;
    }
    if (s >= 60) {
        m = parseInt(s / 60);
        s %= 60;
    }
    s = s.toFixed(msFixed)
    if (ss === false && s % 1 == 0) ss = '';
    return (hour ? _s(h, sh) : _s2(h, sh)) + _s(m, sm) + _s(s, ss);
}

function getTime1(s, sh = _l('时'), sm = _l('分')) {
    s = Number(s);
    if (s >= 86400) {
        return parseInt(s / 86400) + _l('天');
    }
    var h = 0,
        m = 0;
    if (s >= 3600) {
        h = parseInt(s / 3600);
        s %= 3600;
    }
    if (s >= 60) {
        m = parseInt(s / 60);
        s %= 60;
    }
    return _s1(h, sh) + _s(m, sm);
}

function parseTime(s) {
    var r = {};
    s = Number(s);
    if (s >= 86400) {
        r.d = parseInt(s / 86400);
    }
    var h = 0,
        m = 0;
    if (s >= 3600) {
        r.h = parseInt(s / 3600);
        s %= 3600;
    }
    if (s >= 60) {
        r.m = parseInt(s / 60);
        s %= 60;
    }
    r.s = s;
    return r;
}

function getVal(value, defaultV) {
    return value === undefined || value == '' ? defaultV : value;
}


function getFileName(s, ext = false) {
    var name = typeof(s) == 'string' ? s.split('\\').pop() : '';
    if (!ext){
        var a = name.split('.');
        a.pop();
        name = a.join('.');
    }
    return name;
}

function randNum(min, max) {
    return parseInt(Math.random() * (max - min + 1) + min, 10);
}

function toTime(s) {
    var a = s.split(':');
    if (a.length == 1) return s;
    if (a.length == 1) return Number(s);
    if (a.length == 2) {
        a.unshift(0);
    }
    return a[0] * 3600 + a[1] * 60 + a[2] * 1;
}

function _l(s) {
    return s;
}

function _s1(s, j = '') {
    s = parseInt(s);
    return (s == 0 ? '' : (s < 10 ? '0' + s : s) + j);
}

function _s(i, j = '') {
    return (i < 10 ? '0' + i : i) + j;
}

function _s2(s, j = '') {
    s = parseInt(s);
    return (s <= 0 ? '' : s + j);
}

function srcollVideo(e, video) {
    if(e.originalEvent) e = e.originalEvent;
    if ($('input:focus').length) return;
    if(!e.ctrlKey && !e.shiftKey && !e.altKey) return;

    var d = $(e.target);
    if (d.parents('.dropdown-menu').length) return; // 裁剪列表

    if (!video) video = e.currentTarget;
    var duration = video.duration;
    if (!isNaN(duration)) {
        var add;
        if (e.altKey) {
            add = 1;
        } else
        if (e.ctrlKey) {
            add = 5;
        } else {
            add = duration * 0.01; // 视频的1%
        }
        if (add < 1) add = 1;
        add = e.deltaY > 0 ? 0 - add : add;
        video.currentTime += add;
       clearEventBubble(e);
    }
}

function toggleFullScreen() {
    if (!document.fullscreenElement && // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        $(window).resize();
        return true;
    }
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
    $(window).resize();
    return false;
}

function insertStyle(cssText) {
    var head = document.getElementsByTagName("head")[0];
    var style = document.createElement("style");
    var rules = document.createTextNode(cssText);
    style.type = "text/css";
    if (style.styleSheet) {
        style.styleSheet.cssText = rules.nodeValue;
    } else {
        style.appendChild(rules);
    }
    head.appendChild(style);
    return style;
}


function setConfig(k, v) {
    g_config[k] = v;
    local_saveJson('config', g_config);
    if(typeof(onSetConfig) == 'function') onSetConfig(k, v);
}

function getConfig(k, def) {
    var v = g_config[k];
    if (v == undefined) v = def;
    return v;
}

function domSelector(opts, s = '') {
    if (typeof(opts) != 'object') opts = { action: opts };
    for (var key in opts) {
        s += '[data-' + key;
        if (opts[key] !== '') {
            s += '="' + opts[key] + '"';
        }
        s += ']';
    }
    return $(s);
}

function uniqueArr(arr) {
    return Array.from(new Set(arr));
}

function dragFile(ev, src) {
    hidePreview && hidePreview();
    typeof(g_player) != 'undefined' && g_player.playVideo(false);
    var target = $(ev.currentTarget);
    ev.preventDefault();
    var files = [];
    var icon = '';
    if (ev.ctrlKey) {
        // 获取所有同样class的元素
        for (var selected of $('.' + target.attr('class').replaceAll(' ', '.'))) {
            files.push(selected.dataset.file);
        }
    } else {
        files = [target.attr('data-file')];
        icon = target.attr('data-icon') || src || '';
        if (icon.substr(0, 1) == '.') icon = icon.replace('.', '*path*');
    }
    g_cache.dragFile = files;
    ipc_send('ondragstart', {
        files: files,
        icon: icon,
    });
}

function ipc_send(type, msg) {
    var data = {
        type: type,
        msg: msg
    }
    if (typeof(_api) != 'undefined') {
        _api.method(data); // ELECTRON
    } else {
        console.log(JSON.stringify(data));
    }
}
