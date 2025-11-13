var Key;
(function (Key) {
    Key[Key["Backspace"] = 8] = "Backspace";
    Key[Key["Tab"] = 9] = "Tab";
    Key[Key["Enter"] = 13] = "Enter";
    Key[Key["Shift"] = 16] = "Shift";
    Key[Key["Ctrl"] = 17] = "Ctrl";
    Key[Key["Alt"] = 18] = "Alt";
    Key[Key["Pause"] = 19] = "Pause";
    Key[Key["CapsLock"] = 20] = "CapsLock";
    Key[Key["Escape"] = 27] = "Escape";
    Key[Key["Space"] = 32] = "Space";
    Key[Key["PageUp"] = 33] = "PageUp";
    Key[Key["PageDown"] = 34] = "PageDown";
    Key[Key["Left"] = 37] = "Left";
    Key[Key["Up"] = 38] = "Up";
    Key[Key["Right"] = 39] = "Right";
    Key[Key["Down"] = 40] = "Down";
    Key[Key["Insert"] = 45] = "Insert";
    Key[Key["Delete"] = 46] = "Delete";
    Key[Key["F1"] = 112] = "F1";
    Key[Key["F2"] = 113] = "F2";
    Key[Key["F3"] = 114] = "F3";
    Key[Key["F4"] = 115] = "F4";
    Key[Key["F5"] = 116] = "F5";
    Key[Key["F7"] = 117] = "F7";
    Key[Key["F8"] = 118] = "F8";
    Key[Key["F9"] = 119] = "F9";
    Key[Key["F10"] = 120] = "F10";
    Key[Key["F11"] = 121] = "F11";
    Key[Key["F12"] = 122] = "F12";
})(Key || (Key = {}));
Array.prototype.contains = function (value) {
    return this.indexOf(value) > -1;
};
Array.prototype.shuffle = function () {
    let index = this.length, rand = 0;
    let temp;
    while (index != 0) {
        rand = Math.floor(Math.random() * index);
        index -= 1;
        temp = this[index];
        this[index] = this[rand];
        this[rand] = temp;
    }
};
Array.prototype.__defineGetter__("first", function () {
    return (this.length) ? this[0] : null;
});
Array.prototype.__defineGetter__("last", function () {
    return (this.length) ? this[this.length - 1] : null;
});
Date.prototype.addMinutes = function (minutes) {
    return new Date(this.getTime() + minutes * 60000);
};
Date.prototype.addHours = function (hours) {
    return new Date(this.getTime() + hours * 60 * 60000);
};
Date.prototype.addDays = function (days) {
    return new Date(this.getTime() + days * 24 * 60 * 60000);
};
class RectObject {
    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    get left() {
        return this.x;
    }
    get top() {
        return this.y;
    }
    get right() {
        return this.x + this.width;
    }
    get bottom() {
        return this.y + this.height;
    }
}
function isDefined(obj) {
    return obj !== undefined && obj !== null;
}
function isUndefined(obj) {
    return obj === undefined || obj === null;
}
function isMobile() {
    return isDefined(window.orientation);
}
function isDesktop() {
    return isUndefined(window.orientation);
}
function getDefault(obj, defaultValue) {
    return isDefined(obj) ? obj : defaultValue;
}
function isArray(obj) {
    return Array.isArray(obj);
}
function isBoolean(obj) {
    return typeof (obj) === "boolean" || obj instanceof Boolean;
}
function isString(obj) {
    return typeof (obj) === "string" || obj instanceof String;
}
function isNumber(obj) {
    if (isNaN(obj))
        return false;
    return typeof obj === "number" || obj instanceof Number;
}
function isObject(obj) {
    return typeof obj === "object" || obj instanceof Object;
}
function isTouchEvent(e) {
    return e instanceof TouchEvent;
}
function isMouseEvent(e) {
    return e instanceof MouseEvent;
}
function getFingerPos(e) {
    if (isMouseEvent(e))
        return {
            clientX: e.clientX,
            clientY: e.clientY
        };
    if (e.touches.length > 0)
        return {
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY
        };
    return {
        clientX: 0,
        clientY: 0
    };
}
function hasTouchSupport() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
function isTypeOf(obj, type) {
    let t = type;
    if (t.name === "String")
        return isString(obj);
    if (t.name === "Number")
        return isNumber(obj);
    if (t.name === "Boolean")
        return isBoolean(obj);
    return obj instanceof type;
}
function tryParseInt(value, defaultValue) {
    let n = parseInt(value);
    return isNumber(n) ? [true, n] : [false, isNumber(defaultValue) ? defaultValue : 0];
}
function navigate(url) {
    location.href = url;
}
function shortDelay(proc) {
    window.setTimeout(proc, 10);
}
function initTouch() {
    function translateTouchMove(event) {
        let touch = event.changedTouches[0];
        let mouseEvent = document.createEvent("MouseEvent");
        mouseEvent.initMouseEvent("mousemover", true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
        touch.target.dispatchEvent(mouseEvent);
        mouseEvent.initMouseEvent("mousemove", true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
        touch.target.dispatchEvent(mouseEvent);
        event.preventDefault();
    }
    document.addEventListener("touchmove", translateTouchMove, true);
}
function baseUrl() {
    let proto = window.location.protocol || document.location.protocol;
    let port = location.port;
    if (port.length)
        port = `:${port}`;
    return `${proto}//${document.domain}${port}`;
}
function webPrefix() {
    let styles = window.getComputedStyle(document.documentElement, "");
    return (Array.prototype.slice
        .call(styles)
        .join('')
        .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1];
}
function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
}
function getCookie(name) {
    const cookies = document.cookie.split(';');
    const cookieName = `${name}=`;
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith(cookieName)) {
            const value = cookie.substring(cookieName.length, cookie.length);
            return decodeURIComponent(value);
        }
    }
    return null;
}
function fetchJson(request, action) {
    fetch(request)
        .then(r => r.json())
        .then(d => action(d));
}
function fetchPost(request, body) {
    let s;
    if (isString(body))
        s = body;
    else
        s = (new URLSearchParams(body)).toString();
    fetch(request, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: s
    });
}
function subscribeEvent(endpoint, onevent, onconnect = null) {
    let eventSource = new EventSource(endpoint);
    let retrying = false;
    let healthCheck = setInterval(() => {
        if (eventSource.readyState === EventSource.CLOSED && !retrying) {
            retrying = true;
            clearInterval(healthCheck);
            eventSource.close();
            setTimeout(() => subscribeEvent(endpoint, onevent, onconnect), 2000);
        }
    }, 10000);
    eventSource.onopen = () => onconnect === null || onconnect === void 0 ? void 0 : onconnect();
    eventSource.onmessage = e => onevent(JSON.parse(e.data));
    eventSource.onerror = () => {
        if (eventSource.readyState === EventSource.CLOSED && !retrying) {
            retrying = true;
            clearInterval(healthCheck);
            eventSource.close();
            setTimeout(() => subscribeEvent(endpoint, onevent, onconnect), 2000);
        }
    };
}
function addCookie(name, value, days) {
    let expires;
    if (days) {
        var date = new Date();
        const millisecondsPerDay = 24 * 60 * 60 * 1000;
        date.setTime(date.getTime() + (days * millisecondsPerDay));
        expires = "; expires=" + date.toUTCString();
    }
    else
        expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}
function removeCookie(name) {
    addCookie(name, "", -1);
}
function readCookie(name) {
    name += "=";
    let cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(name) == 0)
            return cookie.substring(name.length, cookie.length);
    }
    return undefined;
}
HTMLElement.prototype.clearChildren = function (keep) {
    let items = [];
    if (keep)
        items = this.getAll(keep);
    this.innerHTML = "";
    for (let item of items)
        this.appendChild(item);
};
HTMLElement.prototype.nthElementChild = function (index) {
    let element = this.firstElementChild;
    while (index > 0) {
        index--;
        element = element.nextElementSibling;
        if (element == undefined)
            return element;
    }
    return element;
};
HTMLElement.prototype.hasClass = function (value) {
    return this.classList.contains(value);
};
HTMLElement.prototype.addClass = function (...value) {
    this.classList.add(...value);
    return this;
};
HTMLElement.prototype.removeClass = function (...value) {
    this.classList.remove(...value);
    return this;
};
HTMLElement.prototype.reapplyClass = function (...value) {
    this.classList.remove(...value);
    let me = this;
    shortDelay(() => me.classList.add(...value));
    return this;
};
HTMLElement.prototype.toggleClass = function (...value) {
    for (let item of value)
        this.classList.toggle(item);
    return this;
};
HTMLElement.prototype.hide = function () {
    setStyle(this, { display: "none" });
};
HTMLElement.prototype.show = function () {
    removeStyle(this, "display");
};
HTMLElement.prototype.mapPoint = function (event) {
    let rect = this.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
};
HTMLElement.prototype.__defineGetter__("bounds", function () {
    let rect = this.getBoundingClientRect();
    return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
});
function getInput(query) {
    return get(query);
}
function executeScripts(element) {
    function nodeNameEquals(elem, name) {
        return elem.nodeName && elem.nodeName.toUpperCase() == name.toUpperCase();
    }
    function evalScript(elem) {
        let data = (elem.text || elem.textContent || elem.innerHTML || "");
        let head = document.getElementsByTagName("head")[0] || document.documentElement;
        let script = document.createElement("script");
        script.type = "text/javascript";
        try {
            script.appendChild(document.createTextNode(data));
        }
        catch (e) {
            script.text = data;
        }
        head.insertBefore(script, head.firstChild);
        head.removeChild(script);
    }
    let scripts = [], script;
    let children = element.childNodes, child;
    for (var i = 0; children[i]; i++) {
        child = children[i];
        if (nodeNameEquals(child, "script") && (!child.type || child.type.toLowerCase() == "text/javascript"))
            scripts.push(child);
    }
    for (var i = 0; scripts[i]; i++) {
        script = scripts[i];
        if (script.parentNode)
            script.parentNode.removeChild(script);
        evalScript(scripts[i]);
    }
}
function loadScript(url, callback) {
    let script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    let loaded = false;
    script.onload = script["onreadystatechange"] = function () {
        if (!loaded && (!this.readyState || this.readyState == "complete")) {
            loaded = true;
            callback();
        }
    };
    let node = document.getElementsByTagName("script")[0];
    node.parentNode.insertBefore(script, node);
}
function setStyle(query, styles) {
    let elements = getAll(query);
    let keys = Object.keys(styles);
    for (let e of elements) {
        let style = e.style;
        for (let k of keys) {
            let value = styles[k];
            style[k] = isNumber(value) ? value + "px" : value;
        }
    }
}
function removeStyle(query, ...styles) {
    let elements = getAll(query);
    const a = 'A'.charCodeAt(0);
    const z = 'Z'.charCodeAt(0);
    for (let style of styles) {
        let index = a;
        while (index <= z) {
            let c = String.fromCharCode(index);
            if (style.includes(c)) {
                style = style.replace(c, "-" + c.toLowerCase());
            }
            index++;
        }
        for (let element of elements)
            element.style.removeProperty(style);
    }
}
function isEventCapable(obj) {
    return isDefined(obj["addEventListener"]);
}
function addEvent(query, name, event) {
    let items = isEventCapable(query) ? [query] : getAll(query);
    for (let item of items)
        item.addEventListener(name, event);
}
function addClass(query, ...value) {
    let items = getAll(query);
    for (let item of items)
        item.addClass(...value);
}
function removeClass(query, ...value) {
    let items = getAll(query);
    for (let item of items)
        item.removeClass(...value);
}
function isBefore(node, sibling) {
    let a = get(node);
    if (!a)
        return false;
    let b = get(sibling);
    if (!b)
        return false;
    if (a == b)
        return false;
    if (a.parentElement != b.parentElement)
        return false;
    while (true) {
        a = a.previousElementSibling;
        if (a == b)
            return true;
        if (a == undefined)
            break;
    }
    return false;
}
function isAfter(node, sibling) {
    let a = get(node);
    if (!a)
        return false;
    let b = get(sibling);
    if (!b)
        return false;
    if (a == b)
        return false;
    if (a.parentElement != b.parentElement)
        return false;
    while (true) {
        a = a.nextElementSibling;
        if (a == b)
            return true;
        if (a == undefined)
            break;
    }
    return false;
}
function selectRange(start, finish) {
    let a = get(start);
    if (a == undefined)
        return [];
    let b = get(finish);
    if (b == undefined)
        return [];
    if (isBefore(a, b)) {
        let c = a;
        a = b;
        b = c;
    }
    else if (!isAfter(a, b))
        return [];
    let selection = [];
    while (a != b) {
        selection.push(a);
        a = a.nextElementSibling;
    }
    selection.push(a);
    return selection;
}
function acceptDroppedFiles(element, ondrop) {
    element.addEventListener("dragover", (e) => {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    });
    element.addEventListener("drop", (e) => {
        e.stopPropagation();
        e.preventDefault();
        ondrop(e.dataTransfer.files);
    });
}
function addStyleSheet(href, onload) {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    document.getElementsByTagName("head")[0].appendChild(link);
    if (onload)
        link.addEventListener("load", onload);
    link.href = href;
}
function addJavaScript(src, onload) {
    let script = document.createElement("script");
    script.type = "text/javascript";
    document.body.appendChild(script);
    if (onload)
        script.addEventListener("load", onload);
    script.src = src;
}
class LocalCache {
    constructor() {
        this.data = {};
    }
    remove(url) {
        delete this.data[url];
    }
    exists(url) {
        return this.data.hasOwnProperty(url) && isDefined(this.data[url]);
    }
    recall(url) {
        return this.data[url];
    }
    store(url, value) {
        this.data[url] = value;
    }
}
class WebRequest {
    constructor(requestType = "text") {
        this.requestType = requestType;
        this.localCache = new LocalCache();
        this.httpRequest = new XMLHttpRequest();
        this.httpRequest.responseType = requestType;
        this.httpRequest.onload = () => this.httpRequestLoad();
        this.httpRequest.onerror = () => this.httpRequestError();
        this.succcessCallback = null;
        this.errorCallback = null;
    }
    sendComplete(data) {
        this.responseText = undefined;
        this.responseBytes = undefined;
        if (this.requestType == "arraybuffer" || this.requestType == "blob")
            this.responseBytes = new Uint8Array(this.httpRequest.response);
        else if (this.requestType == "document")
            this.responseXML = this.httpRequest.responseXML;
        else {
            if (data)
                this.responseText = data;
            else
                this.responseText = this.httpRequest.responseText;
            if (this.cache)
                this.localCache.store(this.url, this.responseText);
        }
        if (this.succcessCallback)
            this.succcessCallback(this);
    }
    httpRequestLoad() {
        let code = this.httpRequest.status;
        if (code > 199 && code < 300)
            this.sendComplete();
        else if (this.errorCallback)
            this.errorCallback(this);
    }
    httpRequestError() {
        if (this.errorCallback)
            this.errorCallback(this);
    }
    set onsuccess(handler) {
        this.succcessCallback = handler;
    }
    set onerror(handler) {
        this.errorCallback = handler;
    }
    get status() {
        return this.httpRequest.status;
    }
    get responseJSON() {
        return JSON.parse(this.responseText);
    }
    send(url, onsuccess, onerror, cache) {
        this.httpRequest.abort();
        this.url = url;
        this.succcessCallback = onsuccess;
        this.errorCallback = onerror;
        this.cache = cache;
        if (cache && this.localCache.exists(url))
            this.sendComplete(this.localCache.recall(url));
        else {
            this.httpRequest.open("GET", url);
            this.httpRequest.send();
        }
    }
    post(url, data, onsuccess, onerror, cache) {
        this.httpRequest.abort();
        this.url = url;
        this.succcessCallback = onsuccess;
        this.errorCallback = onerror;
        this.cache = cache;
        if (cache && this.localCache.exists(url))
            this.sendComplete(this.localCache.recall(url));
        else {
            this.httpRequest.open("POST", url);
            if (data instanceof FormData || isString(data))
                this.httpRequest.send(data);
            else
                this.httpRequest.send(objectToFormData(data));
        }
    }
    cancel() {
        this.httpRequest.abort();
    }
}
function sendWebRequest(url, onsuccess, onerror) {
    let r = new WebRequest();
    r.send(url, onsuccess, onerror);
}
function sendWebRequestType(url, requestType, onsuccess, onerror) {
    let r = new WebRequest(requestType);
    r.send(url, onsuccess, onerror);
}
function postWebRequest(url, data, onsuccess, onerror) {
    let r = new WebRequest();
    r.post(url, data, onsuccess, onerror);
}
function postWebRequestType(url, data, requestType, onsuccess, onerror) {
    let r = new WebRequest(requestType);
    r.post(url, data, onsuccess, onerror);
}
function objectToFormData(obj) {
    if (obj == undefined)
        return undefined;
    let data = new FormData();
    let keys = Object.keys(obj);
    for (let k of keys) {
        let value = obj[k];
        data.append(k, value);
    }
    return data;
}
function formSubmit(form, prepare) {
    let formData = new FormData(form);
    let request = new XMLHttpRequest();
    if (prepare)
        prepare(request);
    request.open(form.getAttribute("method"), form.getAttribute("action"), true);
    request.send(formData);
    return request;
}
Date.fromString = function (s) {
    var i = Date.parse(s);
    return new Date(i);
};
const DateShortFormat = "#M#/#DD#/#YYYY# #h#:#mm# #AMPM#";
const DateShortDayFormat = "#MM#/#DD# #hh#:#mm# #ampm#";
const DateLongFormat = "#DDDD# #MMMM# #D#, #YYYY# #h#:#mm# #AMPM#";
const DateDefaultFormat = DateLongFormat;
Date.prototype.format = function (formatString) {
    let YYYY, YY, MMMM, MMM, MM, M, DDDD, DDD, DD, D, hhh, hh, h, mm, m, ss, s, ampm, AMPM, dMod, th;
    let dateObject = this;
    YY = ((YYYY = dateObject.getFullYear()) + "").slice(-2);
    MM = (M = dateObject.getMonth() + 1) < 10 ? ("0" + M) : M;
    MMM = (MMMM = ["January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"][M - 1]).substring(0, 3);
    DD = (D = dateObject.getDate()) < 10 ? ("0" + D) : D;
    DDD = (DDDD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
        "Saturday"][dateObject.getDay()]).substring(0, 3);
    th = (D >= 10 && D <= 20) ? "th" : ((dMod = D % 10) == 1) ? "st" : (dMod == 2) ? "nd" : (dMod == 3) ? "rd" : "th";
    formatString = (formatString) ? formatString : DateDefaultFormat;
    formatString = formatString.replace("#YYYY#", YYYY).replace("#YY#", YY).replace("#MMMM#", MMMM).replace("#MMM#", MMM).replace("#MM#", MM).replace("#M#", M).replace("#DDDD#", DDDD).replace("#DDD#", DDD).replace("#DD#", DD).replace("#D#", D).replace("#th#", th);
    h = (hhh = dateObject.getHours());
    if (h == 0)
        h = 24;
    if (h > 12)
        h -= 12;
    hhh = hhh < 10 ? ('0' + hhh) : hhh;
    hh = h < 10 ? ('0' + h) : h;
    AMPM = (ampm = hhh < 12 ? "am" : "pm").toUpperCase();
    mm = (m = dateObject.getMinutes()) < 10 ? ("0" + m) : m;
    ss = (s = dateObject.getSeconds()) < 10 ? ("0" + s) : s;
    return formatString
        .replace("#hhh#", hhh)
        .replace("#hh#", hh)
        .replace("#h#", h)
        .replace("#mm#", mm)
        .replace("#m#", m)
        .replace("#ss#", ss)
        .replace("#s#", s)
        .replace("#ampm#", ampm)
        .replace("#AMPM#", AMPM);
};
Date.prototype.timeAgo = function () {
    var a = new Date();
    var b = this;
    var diff = a - b;
    var seconds = Math.floor(diff / 1000);
    var interval = Math.floor(seconds / 31536000);
    if (interval > 1)
        return interval + " year(s) ago";
    if (interval == 1)
        return "1 year ago";
    interval = Math.floor(seconds / 2592000);
    if (interval > 1)
        return interval + " months ago";
    if (interval == 1)
        return "1 month ago";
    interval = Math.floor(seconds / 86400);
    if (interval > 1)
        return interval + " days ago";
    if (interval == 1)
        return "1 day ago";
    interval = Math.floor(seconds / 3600);
    if (interval > 1)
        return interval + " hours ago";
    if (interval == 1)
        return interval + "1 hour ago";
    interval = Math.floor(seconds / 60);
    if (interval > 1)
        return interval + " minutes ago";
    if (interval == 1)
        return interval + "1 minute ago";
    return Math.floor(seconds) + " seconds ago";
};
class TimeLeft {
    constructor(s) {
        this.time = 0;
        if (s.isEmpty() || s[0] != "P") {
            this.time = 604800 * 2;
            this.message = "Inactive";
            return;
        }
        if (s == "PT0S") {
            this.message = "Completed";
            return;
        }
        let phrase = "";
        let count = 0;
        let n = "";
        for (let c of s) {
            if (c >= '0' && c <= '9')
                n += c;
            else if (c == 'D') {
                let x = n;
                n = "";
                if (x.isEmpty())
                    continue;
                this.time += parseInt(x) * 86400;
                if (count < 2)
                    phrase = `${phrase} ${x}d`;
                count++;
            }
            else if (c == 'H') {
                let x = n;
                n = "";
                if (x.isEmpty())
                    continue;
                this.time += parseInt(x) * 3600;
                if (count < 2)
                    phrase = `${phrase} ${x}h`;
                count++;
            }
            else if (c == 'M') {
                let x = n;
                n = "";
                if (x.isEmpty())
                    continue;
                this.time += parseInt(x) * 60;
                if (count < 2)
                    phrase = `${phrase} ${x}m`;
                count++;
            }
            else if (c == 'S') {
                let x = n;
                n = "";
                if (x.isEmpty())
                    continue;
                this.time += parseInt(x) * 1;
                if (count < 2)
                    phrase = `${phrase} ${x}s`;
                count++;
            }
            else
                n = "";
        }
        this.message = phrase;
    }
    toString() {
        return this.message;
    }
}
function convertDates(obj, ...names) {
    if (names.length == 0)
        return obj;
    for (let prop in obj) {
        let p = obj[prop];
        if (isString(p)) {
            if (names.contains(p))
                obj[prop] = new Date(p);
        }
        else if (isObject(p))
            convertDates(p, ...names);
    }
    return obj;
}
class Test {
    static verify(condition, name) {
        Test.writeLine(name, ": ", condition ? "success" : "fail");
    }
    static writeBreak(message) {
        let h2 = document.createElement("h2");
        if (message)
            h2.innerText = message;
        document.body.appendChild(h2);
    }
    static writeLine(...content) {
        let div = document.createElement("div");
        div.innerText = content.join("");
        document.body.appendChild(div);
    }
}
if (!String.prototype.repeat) {
    String.prototype.repeat = function (count) {
        if (this == null)
            throw new TypeError('can\'t convert ' + this + ' to object');
        count = +count;
        if (count != count)
            count = 0;
        if (count < 0)
            throw new RangeError('repeat count must be non-negative');
        if (count == Infinity)
            throw new RangeError('repeat count must be less than infinity');
        count = Math.floor(count);
        let s = this;
        if (s.length == 0 || count == 0)
            return '';
        if (s.length * count >= 1 << 28)
            throw new RangeError('repeat count must not overflow maximum string size');
        var maxCount = s.length * count;
        count = Math.floor(Math.log(count) / Math.log(2));
        while (count) {
            s += s;
            count--;
        }
        s += s.substring(0, maxCount - s.length);
        return s;
    };
}
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0;
        padString = String(typeof padString !== 'undefined' ? padString : ' ');
        if (this.length >= targetLength)
            return String(this);
        targetLength = targetLength - this.length;
        if (targetLength > padString.length)
            padString += padString.repeat(targetLength / padString.length);
        return padString.slice(0, targetLength) + String(this);
    };
}
if (!String.prototype.padEnd) {
    String.prototype.padEnd = function padEnd(targetLength, padString) {
        targetLength = targetLength >> 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (this.length > targetLength)
            return String(this);
        targetLength = targetLength - this.length;
        if (targetLength > padString.length)
            padString += padString.repeat(targetLength / padString.length);
        return String(this) + padString.slice(0, targetLength);
    };
}
String.prototype.replaceAll = function (search, replacement) {
    return this.split(search).join(replacement);
};
String.prototype.writeLine = function () {
    Test.writeLine(this);
};
String.prototype.hashCode = function () {
    let hash = 0;
    if (this.length == 0)
        return hash;
    for (var i = 0; i < this.length; i++) {
        var character = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + character;
        hash = hash & hash;
    }
    return hash;
};
String.prototype.isEmpty = function () {
    return (this.length === 0 || !this.trim());
};
String.prototype.splitTrim = function (separator) {
    let result = [];
    let items = this.split(isDefined(separator) ? separator : " ");
    for (let s of items) {
        s = s.trim();
        if (s.length)
            result.push(s);
    }
    return result;
};
String.prototype.format = function (...args) {
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != "undefined" ? args[number] : match;
    });
};
String.prototype.toElement = function () {
    let block = document.createElement("div");
    block.innerHTML = this;
    return block.firstElementChild;
};
Number.prototype.withCommas = function () {
    return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    ;
};
Number.prototype.toBytes = function () {
    let bytes = Math.floor(this);
    if (bytes < 1)
        return "0 Bytes";
    var k = 1000;
    var sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};
Number.prototype.toTimeSpan = function () {
    let hours = Math.floor(this / 3600);
    let minutes = Math.floor((this - (hours * 3600)) / 60);
    let seconds = Math.floor(this - (hours * 3600) - (minutes * 60));
    if (hours > 0) {
        let m = minutes.toString();
        if (m.length < 1)
            m = "0" + m;
        let s = seconds.toString();
        if (s.length < 1)
            s = "0" + s;
        return `${hours}:${m}:${s}`;
    }
    else {
        let s = seconds.toString();
        if (s.length < 1)
            s = "0" + s;
        return `${minutes}:${s}`;
    }
};
class Guid {
    constructor() {
        this.value = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    toString() {
        return this.value;
    }
}
;
class EventManager {
    constructor() {
        this.events = {};
    }
    addEventListener(name, handler) {
        if (!this.events[name])
            this.events[name] = [];
        this.events[name].push(handler);
        return () => this.events[name] = this.events[name].filter(h => h !== handler);
    }
    notify(eventName, ...args) {
        const handlers = this.events[eventName] || [];
        for (const handler of handlers)
            handler(...args);
    }
}
class Messages {
    static notifyConnect() {
        for (const i of Messages.items)
            i === null || i === void 0 ? void 0 : i.onconnect();
    }
    static notifyMessage(m) {
        for (const i of Messages.items)
            if (i.name == m.name)
                i === null || i === void 0 ? void 0 : i.onmessage(m.payload);
    }
    static subscribe(name, onconnect, onmessage) {
        Messages.items.push({ "name": name, "onconnect": onconnect, "onmessage": onmessage });
    }
    static connect(endpoint) {
        let eventSource = new EventSource(endpoint);
        let retrying = false;
        let healthCheck = setInterval(() => {
            if (eventSource.readyState === EventSource.CLOSED && !retrying) {
                retrying = true;
                clearInterval(healthCheck);
                eventSource.close();
                setTimeout(() => Messages.connect(endpoint), 2000);
            }
        }, 10000);
        eventSource.onopen = () => Messages.notifyConnect();
        eventSource.onmessage = e => Messages.notifyMessage(JSON.parse(e.data));
        eventSource.onerror = () => {
            if (eventSource.readyState === EventSource.CLOSED && !retrying) {
                retrying = true;
                clearInterval(healthCheck);
                eventSource.close();
                setTimeout(() => Messages.connect(endpoint), 2000);
            }
        };
    }
}
Messages.items = [];
function main() {
    let title = get("#movie-title");
    let year = get("#movie-year");
    let search = get("#search-btn");
    let result = get("#result");
    function movieSearch() {
        let t = title.value.trim();
        if (t.length < 1)
            return;
        t = encodeURIComponent(t);
        let y = parseInt(year.value.trim());
        if (Number.isNaN(y))
            y = 0;
        if (y < 1900 || y > 3000)
            y = 0;
        let s = "";
        if (y > 0)
            s = `?action=search&title=${t}&year=${y}`;
        else
            s = `?action=search&title=${t}`;
        fetch(s);
    }
    search.addEventListener("click", movieSearch);
    function movieReceived(m) {
        result.innerHTML = m.plot;
    }
    Messages.subscribe("movies", null, movieReceived);
    Messages.connect("/events");
}
//# sourceMappingURL=search.js.map