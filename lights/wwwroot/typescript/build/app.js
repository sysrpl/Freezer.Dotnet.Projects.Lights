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
let debug = (s) => { };
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
function subscribeEvent(endpoint, onconnect, onmessage) {
    let eventSource = null;
    let dead = false;
    function recreate() {
        eventSource = new EventSource(endpoint);
        eventSource.onopen = () => onconnect === null || onconnect === void 0 ? void 0 : onconnect();
        eventSource.onmessage = (e) => onmessage === null || onmessage === void 0 ? void 0 : onmessage(JSON.parse(e.data));
        eventSource.onerror = () => dead = true;
    }
    function heartbeat() {
        if (eventSource.readyState === EventSource.CLOSED || dead) {
            eventSource.close();
            dead = false;
            recreate();
        }
    }
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            eventSource === null || eventSource === void 0 ? void 0 : eventSource.close();
            dead = false;
            recreate();
        }
    });
    recreate();
    setInterval(heartbeat, 5000);
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
        var _a;
        for (const i of Messages.items)
            (_a = i.onconnect) === null || _a === void 0 ? void 0 : _a.call(i);
    }
    static notifyMessage(m) {
        var _a;
        for (const i of Messages.items)
            if (i.name == m.name)
                (_a = i.onmessage) === null || _a === void 0 ? void 0 : _a.call(i, m.payload);
    }
    static subscribe(name, onconnect, onmessage) {
        Messages.items.push({ "name": name, "onconnect": onconnect, "onmessage": onmessage });
    }
    static connect(endpoint) {
        subscribeEvent(endpoint, Messages.notifyConnect, Messages.notifyMessage);
    }
}
Messages.items = [];
class ScrollArea {
    constructor(area) {
        this.isDown = false;
        this.startY = 0;
        this.scrollTop = 0;
        this.lastY = 0;
        this.lastTime = 0;
        this.velocity = 0;
        this.momentumTimer = 0;
        this.scrolling = false;
        this.releaseCapture = () => {
            if (!this.isDown)
                return;
            this.isDown = false;
            this.scrolling = false;
            if (this.momentumTimer)
                clearInterval(this.momentumTimer);
            this.momentumTimer = 0;
        };
        this.updateIcons = () => {
            const scrollable = this.box.scrollHeight > this.box.clientHeight + 2;
            if (!scrollable) {
                this.up.classList.add('hidden');
                this.down.classList.add('hidden');
                return;
            }
            let top = this.box.scrollTop <= 1;
            let bottom = this.box.scrollTop + this.box.clientHeight >= this.box.scrollHeight - 1;
            this.up.classList.toggle('hidden', top);
            this.down.classList.toggle('hidden', bottom);
        };
        this.boxMouseDown = (e) => {
            if (this.momentumTimer)
                clearInterval(this.momentumTimer);
            let me = this;
            setTimeout(() => { me.scrolling = false; }, 100);
            this.momentumTimer = 0;
            this.isDown = true;
            this.startY = e.pageY - this.box.offsetTop;
            this.scrollTop = this.box.scrollTop;
            this.lastY = this.startY;
            this.lastTime = Date.now();
            this.velocity = 0;
            e.preventDefault();
        };
        this.boxMouseUp = (e) => {
            if (!this.isDown)
                return;
            if (this.momentumTimer)
                clearInterval(this.momentumTimer);
            this.isDown = false;
            const decay = 0.95;
            let me = this;
            function timer() {
                me.box.scrollTop -= me.velocity;
                me.velocity *= decay;
                if (Math.abs(me.velocity) < 0.2) {
                    clearInterval(me.momentumTimer);
                    me.scrolling = false;
                }
            }
            this.momentumTimer = setInterval(timer, 16);
        };
        this.windowMouseMove = (e) => {
            if (!this.isDown)
                return;
            const y = e.pageY - this.box.offsetTop;
            const now = Date.now();
            const dy = y - this.lastY;
            const dt = now - this.lastTime;
            if (dt > 0)
                this.velocity = dy / dt * 20;
            this.lastY = y;
            this.lastTime = now;
            let prior = this.box.scrollTop;
            let next = this.scrollTop - (y - this.startY);
            this.box.scrollTop = this.scrollTop - (y - this.startY);
            if (Math.abs(prior - next) > 5)
                this.scrolling = true;
            e.preventDefault();
        };
        if (!ScrollArea._current)
            ScrollArea._current = this;
        this.area = document.querySelector(area);
        this.box = this.area.querySelector(".scrollbox");
        this.up = this.area.querySelector(".up");
        this.down = this.area.querySelector(".down");
        this.updateIcons();
        this.box.addEventListener('scroll', this.updateIcons);
        window.addEventListener('resize', this.updateIcons);
        window.setInterval(this.updateIcons, 500);
        this.box.addEventListener('mousedown', this.boxMouseDown);
        this.box.addEventListener('mouseup', this.boxMouseUp);
        window.addEventListener('mousemove', this.windowMouseMove);
    }
    static get current() {
        return ScrollArea._current;
    }
    scollTop() { this.box.scrollTop = 0; }
    get active() { return this.scrolling; }
}
var SliderOrientation;
(function (SliderOrientation) {
    SliderOrientation[SliderOrientation["Horizontal"] = 0] = "Horizontal";
    SliderOrientation[SliderOrientation["Vertical"] = 1] = "Vertical";
})(SliderOrientation || (SliderOrientation = {}));
class Slider {
    constructor(slider, associate) {
        let knob = document.createElement("div");
        knob.classList.add("knob");
        this._slider = get(slider);
        this._slider.appendChild(knob);
        this._slider["slider"] = this;
        this._knob = knob;
        this._associate = associate ? get(associate) : null;
        this._position = 0;
        this._min = 0;
        this._max = 100;
        this._step = 1;
        this._offset = 26;
        this._orientation = SliderOrientation.Horizontal;
        this._inverted = false;
        this._timer = 0;
        this.onchange = null;
        this.onsubmit = null;
        window.addEventListener("resize", () => this.move(this._position));
        function sliderMouseMove(e, s) {
            let rect = s._slider.getBoundingClientRect();
            let pos = getFingerPos(e);
            if (s._orientation == SliderOrientation.Horizontal) {
                let x = pos.clientX - rect.left;
                if (x < 0)
                    x = 0;
                else if (x > rect.width)
                    x = 1;
                else
                    x = x / rect.width;
                if (s._inverted)
                    x = 1 - x;
                let range = s._max - s._min;
                s.position = range * x + s._min;
            }
            else {
                let y = pos.clientY - rect.top;
                if (y < 0)
                    y = 0;
                else if (y > rect.height)
                    y = 1;
                else
                    y = y / rect.height;
                if (s._inverted)
                    y = 1 - y;
                let range = s._max - s._min;
                s.position = range * y + s._min;
            }
        }
        function sliderMouseUp(e, s) {
            if (isMouseEvent(e)) {
                if (e.button == 0) {
                    s._knob.removeClass("pressed");
                    document._slider = null;
                }
            }
            else {
                s._knob.removeClass("pressed");
                document._slider = null;
            }
        }
        if (hasTouchSupport()) {
            this._slider.addEventListener("touchstart", e => {
                document["_slider"] = this;
                this._knob.addClass("pressed");
                sliderMouseMove(e, this);
                e.stopPropagation();
            });
            if (isUndefined(window["_slider"])) {
                window["_slider"] = true;
                document.addEventListener("touchmove", e => {
                    if (document["_slider"]) {
                        let s = document["_slider"];
                        sliderMouseMove(e, s);
                    }
                });
                document.addEventListener("touchend", e => {
                    if (document["_slider"]) {
                        let s = document["_slider"];
                        sliderMouseUp(e, s);
                    }
                });
            }
        }
        else {
            this._slider.addEventListener("mousedown", e => {
                document["_slider"] = this;
                this._knob.addClass("pressed");
                sliderMouseMove(e, this);
                e.stopPropagation();
            });
            if (isUndefined(window["_slider"])) {
                window["_slider"] = true;
                document.addEventListener("mousemove", e => {
                    if (document["_slider"]) {
                        let s = document["_slider"];
                        sliderMouseMove(e, s);
                    }
                });
                document.addEventListener("mouseup", e => {
                    if (document["_slider"]) {
                        let s = document["_slider"];
                        sliderMouseUp(e, s);
                    }
                });
            }
        }
        setTimeout(this.update.bind(this), 10);
    }
    update() {
        if (this._associate)
            this._associate.innerText = this._position.toString();
        if (this._orientation == SliderOrientation.Horizontal) {
            let width = this._slider.getBoundingClientRect().width - this._offset - 2;
            let range = this._max - this._min;
            let percent = (this._position - this.min) / range;
            if (this._inverted)
                percent = 1 - percent;
            this._knob.style.left = (width * percent).toString() + "px";
        }
        else {
            let height = this._slider.getBoundingClientRect().height - this._offset - 2;
            let range = this._max - this._min;
            let percent = (this._position - this.min) / range;
            if (this._inverted)
                percent = 1 - percent;
            this._knob.style.top = (height * percent).toString() + "px";
        }
    }
    handleSubmit() {
        this._timer = 0;
        if (this.onsubmit)
            this.onsubmit(this);
    }
    get position() {
        return this._position;
    }
    set position(value) {
        this.move(value);
        if (this.onchange)
            this.onchange(this);
        if (this._timer)
            clearTimeout(this._timer);
        this._timer = 0;
        if (this.onsubmit)
            this._timer = setTimeout(this.handleSubmit.bind(this), 250);
    }
    move(p) {
        if (p < this._min)
            p = this._min;
        else if (p > this._max)
            p = this._max;
        let r = 1 / this._step;
        p = Math.round(p * r) / r;
        this._position = p;
        this.update();
    }
    get step() {
        return this._step;
    }
    set step(value) {
        if (value < 0.0001)
            value = 0.0001;
        this._step = value;
        this.position = this._position;
    }
    get min() {
        return this._min;
    }
    set min(value) {
        this._min = value;
        if (this._position < this._min)
            this._position = this._min;
        this.update();
    }
    get max() {
        return this._max;
    }
    set max(value) {
        this._max = value;
        if (this._position > this._max)
            this._position = this._max;
    }
    get offset() {
        return this._offset;
    }
    set offset(value) {
        this._offset = value;
    }
    get orientation() {
        return this._orientation;
    }
    set orientation(value) {
        this._orientation = value;
        this.update();
    }
    get inverted() {
        return this._inverted;
    }
    set inverted(value) {
        this._inverted = value;
    }
    get doc() {
        return document;
    }
}
class Toggle {
    constructor(toggle) {
        this._element = get(toggle);
        this._enabled = false;
        this.onchange = null;
        let knob = document.createElement("div");
        knob.classList.add("knob");
        this._element.appendChild(knob);
        let me = this;
        this._element.addEventListener("click", () => {
            me._enabled = !me.enabled;
            if (me._enabled)
                this._element.classList.add("enabled");
            else
                this._element.classList.remove("enabled");
            if (me.onchange != null)
                me.onchange(me);
        });
    }
    get enabled() {
        return this._enabled;
    }
    get element() {
        return this._element;
    }
    set enabled(value) {
        this._enabled = value;
        if (this._enabled)
            this._element.classList.add("enabled");
    }
}
class GroupBox {
    constructor(box, cookie) {
        this._box = get(box);
        this._expanded = true;
        this._cookie = cookie;
        if (getCookie(cookie) == "hidden")
            this.expanded = false;
        let toggleExpand = (e) => this.expanded = !this.expanded;
        this._box.addEventListener("click", toggleExpand);
    }
    get expanded() {
        return this._expanded;
    }
    set expanded(value) {
        setCookie(this._cookie, value ? "shown" : "hidden", 1000);
        this._expanded = value;
        let c = this._box;
        let chevron = c.get("i");
        if (value) {
            chevron.classList.remove("fa-chevron-right");
            chevron.classList.add("fa-chevron-down");
        }
        else {
            chevron.classList.remove("fa-chevron-down");
            chevron.classList.add("fa-chevron-right");
        }
        while (true) {
            c = c.nextElementSibling;
            if (c == null)
                break;
            if (!c.classList.contains("child"))
                break;
            c.style.display = value ? "" : "none";
            let s = c.get(".slider");
            if (s) {
                let slider = s["slider"];
                slider.move(slider.position);
            }
        }
    }
}
class Held {
    constructor(...elements) {
        this._current = null;
        this._pressTimer = 0;
        this._startX = 0;
        this._startY = 0;
        this._count = 0;
        this._tapCount = 0;
        this._lastTapElement = null;
        this._lastTapTime = 0;
        this._tapTimeout = 0;
        this.TAP_THRESHOLD_MS = 750;
        let startPress = this.startPress.bind(this);
        let handlePointerUp = this.handlePointerUp.bind(this);
        let movePress = this.movePress.bind(this);
        for (let e of elements) {
            e.addEventListener("pointerdown", startPress);
        }
        document.addEventListener("pointerup", handlePointerUp);
        document.addEventListener("pointermove", movePress);
    }
    get current() {
        return this._current;
    }
    wasHeld(e) {
        return e == this.current && this._current["heldCount"] == this._count;
    }
    startPress(e) {
        this.cancelPress();
        this._current = e.currentTarget;
        let x = e.clientX;
        let y = e.clientY;
        this._startX = x;
        this._startY = y;
        this._pressTimer = setTimeout(() => {
            this._count++;
            let item = this._current;
            item["heldCount"] = this._count + 1;
            item.classList.add("flash");
            setTimeout(() => {
                item.classList.remove("flash");
            }, 2000);
            if (this.onheld)
                this.onheld(this);
        }, 2000);
    }
    cancelPress() {
        this._count++;
        if (this._pressTimer)
            clearTimeout(this._pressTimer);
        this._pressTimer = 0;
    }
    movePress(e) {
        if (this._pressTimer == 0)
            return;
        let x = e.clientX;
        let y = e.clientY;
        if (Math.hypot(x - this._startX, y - this._startY) > 10)
            this.cancelPress();
    }
    handlePointerUp(e) {
        const element = this._current;
        this.cancelPress();
        if (!element) {
            this.resetTapTracking();
            return;
        }
        const now = Date.now();
        const timeSinceLastTap = now - this._lastTapTime;
        if (element === this._lastTapElement && timeSinceLastTap < this.TAP_THRESHOLD_MS) {
            this._tapCount++;
        }
        else {
            this._tapCount = 1;
        }
        this._lastTapElement = element;
        this._lastTapTime = now;
        if (this._tapTimeout) {
            clearTimeout(this._tapTimeout);
        }
        if (this._tapCount === 3) {
            this.triggerTripleTap(element);
            this.resetTapTracking();
        }
        else {
            this._tapTimeout = setTimeout(() => {
                this.resetTapTracking();
            }, this.TAP_THRESHOLD_MS);
        }
    }
    triggerTripleTap(element) {
        this._current = element;
        this._count++;
        element["heldCount"] = this._count + 1;
        element.classList.add("flash");
        setTimeout(() => {
            element.classList.remove("flash");
        }, 2000);
        if (this.ontapped) {
            this.ontapped(this);
        }
    }
    resetTapTracking() {
        this._tapCount = 0;
        this._lastTapElement = null;
        this._lastTapTime = 0;
        if (this._tapTimeout) {
            clearTimeout(this._tapTimeout);
            this._tapTimeout = 0;
        }
    }
}
class PlayList {
    constructor(container, cookie) {
        let parent = get(container);
        this._element = document.createElement("div");
        this._element.id = "playlist";
        this._items = [];
        this._cookie = cookie;
        let click = this.itemClick.bind(this);
        for (let i = 0; i < PlayList.count; i++) {
            let c = document.createElement("div");
            c.className = "item";
            c.innerText = (i + 1).toString();
            c.addEventListener("click", click);
            this._element.appendChild(c);
            this._items.push(c);
        }
        parent.appendChild(this._element);
        let s = readCookie(this._cookie);
        let i = 0;
        if (s)
            i = parseInt(s);
        if (Number.isNaN(i))
            i = 0;
        if (i < 0)
            i = 0;
        else if (i > this._items.length - 1)
            i = this._items.length - 1;
        this.index = i;
    }
    itemClick(e) {
        e.stopPropagation();
        let t = e.currentTarget;
        let index = this._items.indexOf(t);
        if (index == this._index)
            return;
        this._index = index;
        for (let i of this._items)
            if (i == t)
                i.classList.add("selected");
            else
                i.classList.remove("selected");
        setCookie(this._cookie, this.index.toString(), 1000);
        if (this.onchange)
            this.onchange(this);
    }
    get index() { return this._index; }
    set index(value) {
        if (value < 0)
            return;
        if (value > this._items.length - 1)
            return;
        this._index = value;
        for (let i = 0; i < this._items.length; i++) {
            let item = this._items[i];
            if (i == value)
                item.classList.add("selected");
            else
                item.classList.remove("selected");
        }
        setCookie(this._cookie, this.index.toString(), 1000);
        if (this.onchange)
            this.onchange(this);
    }
}
PlayList.cookie = "playlist";
PlayList.count = 5;
function initDebug(enabled) {
    let area = get("#debug");
    function write(s) {
        if (!enabled)
            return;
        if (s.length == 0)
            return;
        var d = document.createElement("div");
        d.innerText = s;
        area.prepend(d);
    }
    debug = write;
}
let switchPaint;
function initPaint() {
    const inchx = 185.38;
    const inchy = 23.5;
    let counter = 0;
    let source = get("#paintbox");
    let dest = get("#paint .outline");
    class Coord {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
        scale(s = 0) {
            return new Coord(this.x * s, this.y * s);
        }
        distance(x, y) {
            x = x - this.x;
            y = y - this.y;
            return Math.sqrt(x * x + y * y);
        }
        distanceTo(c) {
            let x = c.x - this.x;
            let y = c.y - this.y;
            return Math.sqrt(x * x + y * y);
        }
        get valid() {
            const m = 5;
            return this.x > -m && this.x < inchx + m && this.y > -m && this.y < inchy + m;
        }
    }
    function translateCoords(x, y) {
        let rectA = source.getBoundingClientRect();
        let rectB = dest.getBoundingClientRect();
        y = y - (rectB.top - rectA.top);
        x = x - (rectB.left - rectA.left);
        if (innerWidth > innerHeight) {
            let scale = 2908 / 372;
            scale = scale * rectB.height / rectB.width;
            x = x / rectB.width;
            y = y / rectB.height;
            y = (y - 0.5) / 0.5;
            y = 1 - (1 + y * scale) / 2;
        }
        else {
            let scale = 370 / 2906;
            scale = scale * rectB.height / rectB.width;
            x = x / rectB.width;
            y = y / rectB.height;
            x = (x - 0.5) / 0.5;
            x = (1 + x / scale) / 2;
            let z = x;
            x = y;
            y = z;
        }
        return new Coord(x * inchx, y * inchy);
    }
    let paint;
    class TouchPoint {
        constructor(x, y, hue, down) {
            this.x = x;
            this.y = y;
            this.hue = hue;
            this.down = down;
            this.timestamp = Date.now();
            this.count = 0;
        }
    }
    class Paint {
        constructor() {
            this.points = [];
            this.last = new Coord(10000, 10000);
            this.pressed = false;
            this.count = 0;
            this.canvas = get('#paintbox');
            this.ctx = this.canvas.getContext('2d');
        }
        clear() {
            this.points = [];
            this.ctx.fillStyle = 'black';
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.last = new Coord(10000, 10000);
        }
        drawHues() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            for (let i = 0; i < this.points.length; i++) {
                if (this.points[i].down)
                    continue;
                const time = Date.now() - this.points[i].timestamp;
                if (time > 1000) {
                    continue;
                }
                let width = 50 - time / 1000 * 50;
                if (width < 2)
                    continue;
                const dx = this.points[i].x - this.points[i - 1].x;
                const dy = this.points[i].y - this.points[i - 1].y;
                this.ctx.beginPath();
                this.ctx.moveTo(this.points[i].x, this.points[i].y);
                this.ctx.lineTo(this.points[i - 1].x, this.points[i - 1].y);
                this.ctx.strokeStyle = `hsl(${this.points[i].hue}, 100%, 50%)`;
                this.ctx.lineWidth = width;
                this.ctx.stroke();
            }
            const now = Date.now();
            this.points = this.points.filter(point => now - point.timestamp < 4000);
            if (this.points.length > 0 && !this.animated) {
                this.animated = true;
                requestAnimationFrame(animatePaint);
            }
            if (this.points.length == 0 && this.animated) {
                this.animated = false;
            }
        }
        addLine(x, y, down) {
            this.count++;
            let h = paintHueSlider.position / 100 * 360;
            if (h == 0)
                h = this.count % 360;
            let p = new TouchPoint(x, y, h, down);
            p.count = this.count;
            this.points.push(p);
            this.drawHues();
            let coord = translateCoords(p.x, p.y);
            let valid = coord.valid;
            const limit = 2;
            if (p.down && valid) {
                this.last = translateCoords(p.x + 0.1, p.y);
                console.log(`paint add ${counter++} h=${h / 360}`);
                fetch(`/?action=paint-add-line&ax=${this.last.x}&ay=${this.last.y}&bx=${coord.x}&by=${coord.y}&hue=${h / 360}`);
                this.last = coord;
            }
            else if (valid && coord.distanceTo(this.last) > limit) {
                if (!this.last.valid) {
                    this.last = translateCoords(p.x + 0.1, p.y);
                }
                console.log(`paint add ${counter++} h=${h / 360}`);
                fetch(`/?action=paint-add-line&ax=${this.last.x}&ay=${this.last.y}&bx=${coord.x}&by=${coord.y}&hue=${h / 360}`);
                this.last = coord;
            }
            else if (valid) {
            }
            else {
                this.last = coord;
            }
        }
        animate(a) {
            this.animated = a;
        }
    }
    paint = new Paint();
    function animatePaint() {
        if (paint.animated) {
            requestAnimationFrame(animatePaint);
            paint.drawHues();
        }
    }
    function resizeCanvas() {
        let a = paint.animated;
        var r = document.querySelector("canvas").getBoundingClientRect();
        paint.canvas.width = r.width;
        paint.canvas.height = r.height;
        paint.clear();
        paint.animate(a);
    }
    window.addEventListener('resize', () => setTimeout(resizeCanvas, 200));
    window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 200));
    resizeCanvas();
    paint.canvas.addEventListener('mousedown', (event) => {
        const rect = paint.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        paint.addLine(x, y, true);
        paint.pressed = true;
    });
    paint.canvas.addEventListener('mousemove', (event) => {
        if (!paint.pressed)
            return;
        const rect = paint.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        paint.addLine(x, y, false);
    });
    paint.canvas.addEventListener('mouseup', (event) => {
        paint.pressed = false;
    });
    paint.canvas.addEventListener('touchstart', (event) => {
        event.preventDefault();
        paint.pressed = true;
        const rect = paint.canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        paint.addLine(x, y, true);
    });
    paint.canvas.addEventListener('touchmove', (event) => {
        event.preventDefault();
        if (!paint.pressed)
            return;
        const rect = paint.canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        paint.addLine(x, y, false);
    });
    paint.canvas.addEventListener('touchend', (event) => {
        event.preventDefault();
        paint.pressed = false;
    });
    let paintHueSlider = new Slider("#hue.slider");
    paintHueSlider.step = 0.1;
    switchPaint = () => {
        paint.clear();
        setTimeout(resizeCanvas, 200);
    };
}
let switchEffects;
function initEffects() {
    let currentColor;
    function effectClick(e) {
        if (currentColor)
            currentColor.classList.remove("selected");
        currentColor = null;
        let t = e.currentTarget;
        let s = t.innerText;
        s = s.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (s == "randomshuffle") {
            let items = getAll("#effects i.fa-square-check");
            if (items.length == 0)
                items = getAll("#effects i.fa-square");
            if (items.length == 0)
                return;
            let group = [];
            for (let i of items) {
                s = i.parentElement.innerText;
                s = s.toLowerCase().replace(/[^a-z0-9]/g, "");
                group.push(s);
            }
            s = group.join(",");
            fetchPost("/?action=effects-set-shuffe", `items=${s}`);
        }
        else
            fetch(`/?action=effects-set-effect&effect=${s}`);
    }
    function effectChecked(e) {
        let t = e.currentTarget;
        if (t.classList.contains("fa-square")) {
            t.classList.remove("fa-square");
            t.classList.add("fa-square-check");
        }
        else {
            t.classList.remove("fa-square-check");
            t.classList.add("fa-square");
        }
        e.stopPropagation();
        let selected = get("#effects .selected");
        if (isUndefined(selected))
            return;
        if (selected.innerText != "Random Shuffle")
            return;
        let items = getAll("#effects i.fa-square-check");
        if (items.length == 0)
            items = getAll("#effects i.fa-square");
        if (items.length == 0)
            return;
        let s;
        let group = [];
        for (let i of items) {
            s = i.parentElement.innerText;
            s = s.toLowerCase().replace(/[^a-z0-9]/g, "");
            group.push(s);
        }
        s = group.join(",");
        fetchPost("/?action=effects-set-shuffe", `items=${s}`);
    }
    getAll("#effects > div").forEach(item => item.addEventListener("click", effectClick));
    getAll("#effects > div > i").forEach(item => item.addEventListener("click", effectChecked));
    function colorClick(e) {
        if (ScrollArea.current.active)
            return;
        let t = e.currentTarget;
        if (currentColor == t)
            return;
        if (currentColor)
            currentColor.classList.remove("selected");
        currentColor = t;
        currentColor.classList.add("selected");
        getAll("#effects.lines>div").forEach(i => i.classList.remove("selected"));
        let s = currentColor.classList[0].replace("color", "");
        fetch(`/?action=effects-set-color&color=${s}`);
    }
    let colors = getAll("#effects #colors div");
    colors.forEach(i => {
        let s = i.className;
        i.style.background = s.replace("color", "#");
        i.addEventListener("click", colorClick);
    });
    switchEffects = function () {
    };
}
let switchMusic;
function initMusic() {
    let musicVolume;
    musicVolume = new Slider("#music-volume .slider");
    musicVolume.max = 100;
    musicVolume.step = 0.01;
    function volumeSubmit() {
        fetch(`/?action=music-set-volume&volume=${musicVolume.position}`);
    }
    musicVolume.onsubmit = volumeSubmit;
    let songControl = get("#music .playing i");
    let songLabel = get("#music .song.label");
    function stopSong() {
        fetch("/?action=music-stop");
        songLabel.innerText = "Now Playing: (nothing)";
        songControl.classList.remove("fa-circle-stop");
        songControl.classList.add("fa-music");
    }
    songControl.addEventListener("click", stopSong);
    let songRandom = get("#music .random");
    function songRandomShuffle() {
        fetch(`/?action=music-random-shuffle&playlist=${playlistIndex}`);
    }
    songRandom.addEventListener("click", songRandomShuffle);
    let playlist = new PlayList("#music .random", "playlist");
    let playlistCount = 5;
    let playlistIndex = 0;
    function rebuildChecks() {
        for (let i = 0; i < folders.length; i++) {
            let folder = folders[i];
            let f = get(`#music .folder[index="${i}"]`);
            if (!f)
                continue;
            let s = f.getAll(".song");
            for (let j = 0; j < s.length; j++) {
                if (j > folder.songs.length - 1)
                    break;
                let checked = folder.checked[playlistIndex][j] != 0;
                let box = s[j].get("i");
                if (checked) {
                    box.removeClass("fa-square");
                    box.addClass("fa-square-check");
                }
                else {
                    box.removeClass("fa-square-check");
                    box.addClass("fa-square");
                }
            }
        }
        updateAllCounts();
    }
    playlist.onchange = (p) => {
        playlistIndex = p.index;
        fetch(`/?action=music-set-playlist&playlist=${playlistIndex}`);
        rebuildChecks();
    };
    playlistIndex = playlist.index;
    let folders = [];
    function updateAllCounts() {
        let i = 0;
        for (let folder of getAll("#music .folder")) {
            let n = 0;
            let f = folders[i];
            if (f.checked.length == playlistCount && f.checked[playlistIndex].length > 0) {
                for (let j = 0; j < f.checked[playlistIndex].length; j++)
                    n += f.checked[playlistIndex][j];
                if (n == 0)
                    folder.classList.add("empty");
                else
                    folder.classList.remove("empty");
            }
            else
                folder.classList.add("empty");
            folder.get(".count").innerText = n.toString();
            i++;
        }
    }
    function updateCount(folder) {
        let i = parseInt(folder.getAttribute("index"));
        let n = 0;
        let f = folders[i];
        if (f.checked.length == playlistCount && f.checked[playlistIndex].length > 0) {
            for (let j = 0; j < f.checked[playlistIndex].length; j++)
                n += f.checked[playlistIndex][j];
            if (n == 0)
                folder.classList.add("empty");
            else
                folder.classList.remove("empty");
        }
        else
            folder.classList.add("empty");
        folder.get(".count").innerText = n.toString();
    }
    function songsRead(f) {
        let folder = null;
        let i = 0;
        for (let search of folders) {
            if (f.name == search.name) {
                folder = get(`#music .folder[index="${i}"]`);
                folders[i] = f;
                break;
            }
            i++;
        }
        if (!folder)
            return;
        let s = "";
        for (let i = 0; i < f.songs.length; i++)
            s = s + `<div class="song selectable"><i class="fa-regular
${f.checked[playlistIndex][i] ? "fa-square-check" : "fa-square"}"></i>${f.songs[i]}</div>`;
        folder.get(".songs").innerHTML = s;
        updateCount(folder);
        musicEvents();
    }
    let held;
    function folderClick(e) {
        if (ScrollArea.current.active)
            return;
        let t = e.target;
        if (t.closest(".song"))
            return;
        t = e.currentTarget;
        if (held.wasHeld(t))
            return;
        t = t.parentElement;
        let a = t.attributes;
        let index = parseInt(a.getNamedItem("index").value);
        let opened = a.getNamedItem("opened").value == "1";
        let icon = t.get(".icon");
        let songs = t.get(".songs");
        if (opened) {
            a.getNamedItem("opened").value = "0";
            icon.classList.remove("fa-folder-open");
            icon.classList.add("fa-folder");
            if (songs)
                songs.classList.add("hidden");
        }
        else {
            a.getNamedItem("opened").value = "1";
            icon.classList.remove("fa-folder");
            icon.classList.add("fa-folder-open");
            if (songs)
                songs.classList.remove("hidden");
            else {
                songs = document.createElement("div");
                songs.classList.add("songs");
                t.appendChild(songs);
                fetchJson(`/?action=music-get-songs&folder=${folders[index].name}`, songsRead);
            }
        }
    }
    function preload(name, index) {
        setTimeout(() => {
            let songs = document.createElement("div");
            songs.classList.add("songs");
            songs.classList.add("hidden");
            let folder = get(`#music .folder[index="${index - 1}"]`);
            folder.appendChild(songs);
            fetchJson(`/?action=music-get-songs&folder=${name}`, songsRead);
        }, index * 250);
    }
    function folderHeld(h) {
        let folder = h.current.parentElement;
        let name = folder.get(".name").innerText;
        let index = parseInt(folder.getAttribute("index"));
        let all = true;
        let f = folders[index];
        for (let i = 0; i < f.songs.length; i++)
            if (f.checked[playlistIndex][i] == 0) {
                all = false;
                break;
            }
        all = !all;
        for (let i = 0; i < f.songs.length; i++) {
            f.checked[playlistIndex][i] = all ? 1 : 0;
        }
        fetch(`/?action=music-set-held&folder=${name}&playlist=${playlistIndex}&held=${all}`);
        rebuildChecks();
    }
    function folderTapped(h) {
        folderHeld(h);
        let t = h.current.parentElement;
        let a = t.attributes;
        let opened = a.getNamedItem("opened").value == "1";
        let icon = t.get(".icon");
        let songs = t.get(".songs");
        if (opened) {
            a.getNamedItem("opened").value = "0";
            icon.classList.remove("fa-folder-open");
            icon.classList.add("fa-folder");
            if (songs)
                songs.classList.add("hidden");
        }
        else {
            a.getNamedItem("opened").value = "1";
            icon.classList.remove("fa-folder");
            icon.classList.add("fa-folder-open");
            if (songs)
                songs.classList.remove("hidden");
        }
    }
    function foldersRead(names) {
        let i = 0;
        let s = "";
        for (let n of names) {
            let f = {
                name: n,
                songs: [],
                checked: Array.from({ length: 5 }, () => [])
            };
            folders.push(f);
            s += `
<div class="folder empty" index="${i++}" opened="0">
    <div class="label selectable">
        <i class="icon fa-solid fa-folder"></i>
        <div class="name">${n}</div>
    </div>
    <div class="count">0</div>
</div>`;
            preload(n, i);
        }
        let node = get("#music #folders");
        node.innerHTML = s;
        let nodes = node.getAll(".folder .label");
        for (let f of nodes)
            f.addEventListener("click", folderClick);
        held = new Held(...nodes);
        held.onheld = folderHeld;
        held.ontapped = folderTapped;
        updateAllCounts();
        musicEvents();
    }
    function foldersFetch() {
        fetchJson("/?action=music-get-folders", foldersRead);
    }
    function checkSong(checkbox) {
        let song = checkbox.parentElement;
        let group = song.parentElement;
        let folder = group.parentElement;
        let f = parseInt(folder.getAttribute("index"));
        let list = folders[f].checked;
        let i = Array.from(group.children).indexOf(song);
        i = list[playlistIndex][i] = (list[playlistIndex][i] + 1) % 2;
        if (i) {
            checkbox.removeClass("fa-square");
            checkbox.addClass("fa-square-check");
        }
        else {
            checkbox.removeClass("fa-square-check");
            checkbox.addClass("fa-square");
        }
        let id = song.innerText.split(".")[0];
        fetch(`/?action=music-check-song&folder=${folders[f].name}&song=${id}&playlist=${playlistIndex}&checked=${i}`);
        updateCount(folder);
    }
    function playSong(song) {
        let folder = song.parentElement.parentElement.get(".label .name").innerText;
        let s = song.innerText;
        let id = s.split(".")[0];
        fetch(`/?action=music-play&folder=${folder}&song=${id}`);
        s = s.substring(s.indexOf(". ") + 2);
        songLabel.innerText = "Now Playing: " + s;
        songControl.classList.remove("fa-music");
        songControl.classList.add("fa-circle-stop");
    }
    foldersFetch();
    function musicClick(e) {
        if (ScrollArea.current.active)
            return;
        var t = e.target;
        if (t.hasClass("fa-square") || t.hasClass("fa-square-check")) {
            checkSong(t);
            return;
        }
        getAll("#music .selectable").forEach(item => item.classList.remove("selected"));
        t = e.currentTarget;
        t.classList.add("selected");
        if (t.hasClass("song"))
            playSong(t);
    }
    function musicEvents() {
        getAll("#music .selectable:not(.attached)").forEach(item => {
            item.addEventListener("click", musicClick);
            item.classList.add("attached");
        });
    }
    musicEvents();
    function volumeRead(i) {
        musicVolume.move(i[0]);
    }
    let current = "";
    let currentTimer = 0;
    function musicChange() {
        let s = current;
        if (s.length > 0) {
            songControl.classList.remove("fa-music");
            songControl.classList.add("fa-circle-stop");
            s = s.substring(s.indexOf(". ") + 2);
            songLabel.innerText = "Now Playing: " + s;
        }
        else {
            songControl.classList.remove("fa-circle-stop");
            songControl.classList.add("fa-music");
            songLabel.innerText = "Now Playing: (nothing)";
        }
    }
    function musicRead(song) {
        current = song[0];
        if (currentTimer)
            clearTimeout(currentTimer);
        currentTimer = setTimeout(musicChange, 500);
    }
    function musicConnect() {
        fetchJson("/?action=music-get-song", musicRead);
    }
    Messages.subscribe("music", musicConnect, musicRead);
    switchMusic = function () {
        fetchJson("/?action=music-get-volume", volumeRead);
    };
}
let switchMovies;
function initMovies() {
    let movieList = [];
    let title = get("#movies .details .title");
    let info = get("#movies .details .info");
    let poster = get("#movies .poster");
    let switcher = get("#movies .switch");
    let singleTab = get("#movies .single");
    let listTab = get("#movies .list");
    let single = true;
    function switcherClick() {
        let i = switcher.get("i");
        single = !single;
        if (single) {
            listTab.style.display = "none";
            singleTab.style.display = "initial";
            i.classList.remove("fa-film");
            i.classList.add("fa-list");
        }
        else {
            singleTab.style.display = "none";
            listTab.style.display = "initial";
            i.classList.remove("fa-list");
            i.classList.add("fa-film");
        }
    }
    function movieClick(e) {
        if (ScrollArea.current.active)
            return;
        getAll("#movies .movie").forEach(e => e.classList.remove("selected"));
        let t = e.currentTarget;
        t.classList.add("selected");
        fetch("/?action=touch");
        let title = t.attributes.getNamedItem("title").value;
        let year = t.attributes.getNamedItem("year").value;
        setTimeout(() => {
            fetch(`/search/?action=search&title=${title}&year=${year}`);
        }, 1000);
    }
    function rebuildList() {
        let s = "";
        for (let m of movieList)
            s += `<div class="movie" title="${m.title}" year="${m.year}"><img title="poster" class="poster" src="/storage/movies/data/${m.movie_id}.jpg">
                <span class="title">${m.title} (${m.year})</span>
                <span class="info">rated ${m.rated} | imdb ${m.imdb_rating} | ${m.genre} | staring ${m.actors.join(", ")}</span>
                <span class="summary">${m.plot}</span>
                </div>`;
        listTab.innerHTML = s;
        getAll("#movies .movie").forEach(i => i.addEventListener("click", movieClick));
    }
    switcher.addEventListener("click", switcherClick);
    function movieReceived(m) {
        title.innerText = `${m.title} (${m.year})`;
        poster.src = `/storage/movies/data/${m.movie_id}.jpg`;
        info.innerHTML = `${m.runtime} <span class="imdb">imdb</span> rating ${m.imdb_rating}
Rated ${m.rated} | ${m.genre}
Directed by ${m.director}
Starring ${m.actors.join(", ")}

Summary: ${m.plot}`;
        let found = movieList.find(x => x.title === m.title && x.year === m.year);
        if (!found) {
            movieList.push(m);
            movieList.sort((a, b) => {
                if (a.title < b.title)
                    return -1;
                if (a.title > b.title)
                    return 1;
                return parseInt(a.year) - parseInt(b.year);
            });
            rebuildList();
        }
        single = false;
        switcherClick();
    }
    function movieListReceived(m) {
        movieList = m;
        movieList.sort((a, b) => {
            if (a.title < b.title)
                return -1;
            if (a.title > b.title)
                return 1;
            return parseInt(a.year) - parseInt(b.year);
        });
        rebuildList();
        fetchJson("/search/?action=search-get-movie-last", movieReceived);
    }
    function movieConnect() {
        fetchJson("/search/?action=search-get-movie-list", movieListReceived);
    }
    Messages.subscribe("movies", movieConnect, movieReceived);
    switchMovies = function () {
    };
}
let switchSettings;
function initSettings() {
    let theme = get("#settings #theme");
    function addTheme(color) {
        let item = document.createElement("div");
        item.classList.add(color);
        theme.appendChild(item);
    }
    function themeClick(e) {
        for (let item of getAll("#settings #theme div"))
            item.classList.remove("selected");
        let t = e.currentTarget;
        t.classList.add("selected");
        let s = t.classList.item(0);
        document.body.className = s;
        setCookie("theme", s, 1000);
    }
    addTheme("purple");
    addTheme("green");
    addTheme("orange");
    addTheme("blue");
    for (let item of getAll("#settings #theme div"))
        item.addEventListener("click", themeClick);
    let cookie = getCookie("theme");
    if (cookie == null) {
        cookie = "blue";
    }
    theme.get("." + cookie).click();
    let toggles = [];
    let t = new Toggle("#settings #projector .toggle");
    t.onchange = (sender) => {
        sender.element.parentElement.get("span").innerText = sender.enabled ? "Projector (on)" : "Projector (off)";
    };
    toggles.push(t);
    t = new Toggle("#settings #mute .toggle");
    t.onchange = (sender) => {
        sender.element.parentElement.get("span").innerText = sender.enabled ? "Mute all audio (yes)" : "Mute all audio (no)";
    };
    toggles.push(t);
    t = new Toggle("#settings #movie .toggle");
    t.onchange = (sender) => {
        sender.element.parentElement.get("span").innerText = sender.enabled ? "Movie (play)" : "Movie (paused)";
    };
    toggles.push(t);
    t = new Toggle("#settings #everything .toggle");
    t.onchange = (sender) => {
        sender.element.parentElement.get("span").innerText = sender.enabled ? "Everything (on)" : "Everything (off)";
        if (sender.enabled) {
            for (let i of toggles)
                if (!i.element.classList.contains("enabled"))
                    i.element.click();
        }
        else {
            for (let i of toggles)
                if (i.element.classList.contains("enabled"))
                    i.element.click();
        }
    };
    let settingsLightIntensity = new Slider("#settings #light-intensity .slider");
    settingsLightIntensity.max = 5;
    settingsLightIntensity.step = 0.01;
    settingsLightIntensity.move(2.5);
    function intensityChange() {
        let s = get("#settings #light-intensity .label");
        let t = settingsLightIntensity.position.toFixed(1);
        s.innerText = `Light (${t})`;
    }
    function intensitySubmit() {
        fetch(`/?action=settings-set-intensity&intensity=${settingsLightIntensity.position}`);
    }
    settingsLightIntensity.onchange = intensityChange;
    settingsLightIntensity.onsubmit = intensitySubmit;
    let settingsLightSpeed = new Slider("#settings #light-speed .slider");
    settingsLightSpeed.min = 0;
    settingsLightSpeed.max = 10;
    settingsLightSpeed.step = 0.001;
    settingsLightSpeed.move(1);
    function speedChange() {
        let s = get("#settings #light-speed .label");
        let p = settingsLightSpeed.position - 5;
        s.innerText = `Speed (${p.toFixed(1)})`;
    }
    function speedSubmit() {
        fetch(`/?action=settings-set-speed&speed=${settingsLightSpeed.position - 5}`);
    }
    settingsLightSpeed.onchange = speedChange;
    settingsLightSpeed.onsubmit = speedSubmit;
    let settingsVolume = new Slider("#settings #audio-volume .slider");
    settingsVolume.max = 100;
    settingsVolume.step = 0.01;
    function volumeSubmit() {
        fetch(`/?action=settings-set-volume&volume=${settingsVolume.position}`);
    }
    settingsVolume.onsubmit = volumeSubmit;
    const sleepLabels = ["sleep after 15 minutes", "sleep after 30 minutes", "sleep after 1 hour",
        "sleep after 4 hours", "sleep after 6 hours", "never goto sleep"];
    let sleepIndex = 0;
    let sleepLabel = get("#settings #sleep .label");
    function sleepSend() {
        fetch(`/?action=settings-set-sleep&sleep=${sleepIndex}`);
    }
    get("#settings #sleep .left").addEventListener("click", (e) => {
        sleepIndex--;
        if (sleepIndex < 0)
            sleepIndex = sleepLabels.length - 1;
        sleepLabel.innerText = sleepLabels[sleepIndex];
        sleepSend();
    });
    get("#settings #sleep .right").addEventListener("click", (e) => {
        sleepIndex++;
        if (sleepIndex > sleepLabels.length - 1)
            sleepIndex = 0;
        sleepLabel.innerText = sleepLabels[sleepIndex];
        sleepSend();
    });
    const visualizerLabels = ["no visualizations", "histogram visualization",
        "levels visualization", "cloud visualization", "wave visualization"];
    let visualIndex = 0;
    let visualLabel = get("#settings #visualizer .label");
    function visualsSend() {
        fetch(`/?action=settings-set-visuals&visuals=${visualIndex}`);
    }
    get("#settings #visualizer .left").addEventListener("click", (e) => {
        visualIndex--;
        if (visualIndex < 0)
            visualIndex = visualizerLabels.length - 1;
        visualLabel.innerText = visualizerLabels[visualIndex];
        visualsSend();
    });
    get("#settings #visualizer .right").addEventListener("click", (e) => {
        visualIndex++;
        if (visualIndex > visualizerLabels.length - 1)
            visualIndex = 0;
        visualLabel.innerText = visualizerLabels[visualIndex];
        visualsSend();
    });
    let sourceMusic = get("#visualsource .music");
    let sourceMusicRadio = get("#visualsource .music i");
    let sourceMicrophone = get("#visualsource .microphone");
    let sourceMicrophoneRadio = get("#visualsource .microphone i");
    function sourceClick(e) {
        let t = e.currentTarget;
        let s = 0;
        if (t == sourceMusic) {
            sourceMusicRadio.removeClass("fa-circle").addClass("fa-circle-dot");
            sourceMicrophoneRadio.removeClass("fa-circle-dot").addClass("fa-circle");
        }
        else {
            sourceMicrophoneRadio.removeClass("fa-circle").addClass("fa-circle-dot");
            sourceMusicRadio.removeClass("fa-circle-dot").addClass("fa-circle");
            s = 1;
        }
        fetch(`/?action=settings-set-visual-source&source=${s}`);
    }
    sourceMusic.addEventListener("click", sourceClick);
    sourceMicrophone.addEventListener("click", sourceClick);
    new GroupBox("#settings .group.lighting", "group-lighting");
    new GroupBox("#settings .group.equipment", "group-equipment");
    new GroupBox("#settings .group.audio", "group-audio");
    new GroupBox("#settings .group.system", "group-system");
    let accessCode = get("#settings #accesscode");
    function accessCodeRead(code) {
        accessCode.innerText = `${code[0]}`;
    }
    ;
    let settings = get("#settings");
    let usageTimer = 0;
    let usageHidden = true;
    let usageSpan = get("#usage");
    function usageRead(u) {
        if (usageHidden || settings.style.display != "block") {
            usageSpan.style.display == "none";
            if (usageTimer)
                clearInterval(usageTimer);
            usageTimer = 0;
            return;
        }
        if (usageTimer == 0)
            usageTimer = setInterval(usageFetch, 5000);
        let left = usageSpan.nthElementChild(0);
        let right = usageSpan.nthElementChild(1);
        left.nthElementChild(0).innerText = `Version: ${u.Version}`;
        left.nthElementChild(1).innerText = `Memory usage: ${u.MemoryUsage.toFixed(0)}MB`;
        left.nthElementChild(2).innerText = `CPU usage: ${u.CpuUsage.toFixed(2)}%`;
        left.nthElementChild(3).innerText = `D0: ${u.DataCount0}`;
        left.nthElementChild(4).innerText = `D1: ${u.DataCount1}`;
        let fps = 0;
        if (u.DataTime0 > 0 && u.DataTime1 > 0)
            fps = 1000 / ((u.DataTime0 + u.DataTime1) / 2);
        else if (u.DataTime0 > 0)
            fps = 1000 / u.DataTime0;
        else if (u.DataTime1 > 0)
            fps = 1000 / u.DataTime1;
        else
            fps = 0;
        left.nthElementChild(5).innerText = `FPS: ${fps.toFixed(1)}`;
        right.nthElementChild(0).innerText = `Date: ${u.Date}`;
        right.nthElementChild(1).innerText = `Threads: ${u.Threads}`;
        right.nthElementChild(2).innerText = `Uptime: ${u.Uptime}`;
        right.nthElementChild(3).innerText = `Network: ${u.NetworkAddress.split(' ')[0]}`;
        right.nthElementChild(4).innerText = `Sent: ${u.NetworkSent.toFixed(2)}MB`;
        right.nthElementChild(5).innerText = `Received: ${u.NetworkReceived.toFixed(2)}MB`;
        usageSpan.style.display = "block";
    }
    function usageFetch() {
        fetchJson("/?action=settings-get-sysinfo", usageRead);
    }
    function usageMouseDown(e) {
        e.stopPropagation();
    }
    function usageClick(e) {
        if (usageTimer)
            window.clearInterval(usageTimer);
        usageTimer = 0;
        let t = usageSpan;
        usageHidden = !usageHidden;
        if (usageHidden)
            t.style.display = "none";
        else
            fetchJson("/?action=settings-get-sysinfo", usageRead);
    }
    get("#information").addEventListener("mousedown", usageMouseDown);
    get("#information").addEventListener("click", usageClick);
    function settingsRead(s) {
        settingsLightIntensity.move(s.intensity);
        intensityChange();
        settingsLightSpeed.move(s.speed + 5);
        speedChange();
        settingsVolume.move(s.volume);
        sleepIndex = s.sleep;
        sleepLabel.innerText = sleepLabels[sleepIndex];
        visualIndex = s.visuals;
        visualLabel.innerText = visualizerLabels[visualIndex];
        if (s.visualsource == 0) {
            sourceMusicRadio.removeClass("fa-circle").addClass("fa-circle-dot");
            sourceMicrophoneRadio.removeClass("fa-circle-dot").addClass("fa-circle");
        }
        else {
            sourceMicrophoneRadio.removeClass("fa-circle").addClass("fa-circle-dot");
            sourceMusicRadio.removeClass("fa-circle-dot").addClass("fa-circle");
        }
    }
    switchSettings = () => {
        fetchJson("/?action=settings-get-all", settingsRead);
        fetchJson("/?action=settings-get-access-code", accessCodeRead);
        settingsLightIntensity.update();
        settingsLightSpeed.update();
        settingsVolume.update();
        if (!usageHidden)
            usageTimer = setInterval(usageFetch, 5000);
    };
}
function main() {
    let local = navigator.userAgent.indexOf("aarch64") > 1 && navigator.userAgent.indexOf("605.1.15") > 1;
    let logo = get("#caption .logo");
    if (local) {
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.body.style.cursor = "none";
        fetch("/?action=loader-quit");
        let notify = get("#notify");
        let messageCode = notify.get(".message .code");
        let messageCodeRead = (code) => {
            messageCode.innerText = `${code[0]}`;
        };
        logo.addEventListener("click", (e) => {
            messageCode.innerText = "------";
            fetchJson("/?action=settings-get-access-code", messageCodeRead);
            notify.classList.remove("hidden");
            fetch("/?action=touch");
        });
        notify.addEventListener("click", (e) => {
            notify.classList.add("hidden");
        });
    }
    else {
        logo.addEventListener("click", (e) => {
            window.open("https://www.woodriverstudio.com/", "_blank");
            fetch("/?action=touch");
        });
    }
    initDebug(false);
    debug(navigator.userAgent);
    debug(new Date().toString());
    let icon = "";
    function iconClick(e) {
        let t = e.currentTarget;
        let s = t.classList.item(0);
        if (s == "power") {
            icon = s;
            fetch(`/?action=stop`).then(() => location.reload());
            return;
        }
        for (let m of getAll("#caption .mode"))
            m.style.display = "none";
        let mode = get("#caption ." + s);
        mode.style.display = "inline";
        get("#icons").style.display = "none";
        get(".scrollarea").style.display = "block";
        let tab = get("#" + s);
        tab.style.display = tab.hasClass("grid") ? "grid" : "block";
        if (s == "paint")
            switchPaint();
        else if (s == "effects")
            switchEffects();
        else if (s == "music")
            switchMusic();
        else if (s == "movies")
            switchMovies();
        else if (s == "settings")
            switchSettings();
        fetch("/?action=touch");
        icon = s;
        if (window.innerHeight > window.innerWidth)
            logo.style.display = "none";
    }
    function homeClick(e) {
        getAll("#caption .mode").forEach(m => m.style.display = "none");
        get(".scrollarea").style.display = "none";
        get("#icons").style.display = "grid";
        getAll(".scrollbox > div").forEach(d => d.style.display = "none");
        if (icon == "settings")
            fetch("/?action=settings-save");
        fetch("/?action=touch");
        icon = "";
        logo.style.display = "initial";
    }
    function modeClick(e) {
        ScrollArea.current.scollTop();
    }
    function lineClick(e) {
        getAll(".scrollbox .lines > div").forEach(e => e.classList.remove("selected"));
        let t = e.currentTarget;
        t.classList.add("selected");
        fetch("/?action=touch");
    }
    document.addEventListener("touchstart", () => { }, true);
    new ScrollArea(".scrollarea");
    get("#caption .home").addEventListener("click", homeClick);
    getAll("#caption .mode").forEach(i => i.addEventListener("click", modeClick));
    getAll("#icons .item").forEach(i => i.addEventListener("click", iconClick));
    getAll(".scrollbox .lines > div").forEach(i => i.addEventListener("click", lineClick));
    initPaint();
    initEffects();
    initMusic();
    initMovies();
    initSettings();
    function reload() {
        fetch(`/?action=stop`).then(() => location.reload());
    }
    Messages.subscribe("reload", null, reload);
    Messages.connect("/events");
    function checkHash() {
        let hash = window.location.hash.slice(1);
        switch (hash) {
            case "paint":
                get("#icons .paint").click();
                break;
            case "effects":
                get("#icons .effects").click();
                break;
            case "music":
                get("#icons .music").click();
                break;
            case "movies":
                get("#icons .movies").click();
                break;
            case "settings":
                get("#icons .settings").click();
                break;
        }
    }
    checkHash();
}
//# sourceMappingURL=app.js.map