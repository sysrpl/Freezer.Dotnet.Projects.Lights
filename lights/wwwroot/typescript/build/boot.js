function get(query) {
    if (typeof query == "string")
        return document.querySelector(query);
    if (query instanceof HTMLElement)
        return query;
    return query[0];
}
function getAll(query) {
    if (typeof query == "string") {
        let nodes = document.querySelectorAll(query);
        return Array.prototype.slice.call(nodes);
    }
    if (query instanceof HTMLElement)
        return [query];
    return query;
}
HTMLElement.prototype.get = function (query) {
    if (typeof query == "string")
        return this.querySelector(query);
    if (query instanceof HTMLElement)
        return query;
    return query[0];
};
HTMLElement.prototype.getAll = function (query) {
    if (typeof query == "string") {
        let nodes = this.querySelectorAll(query);
        return Array.prototype.slice.call(nodes);
    }
    if (query instanceof HTMLElement)
        return [query];
    return query;
};
if (!String.prototype.includes) {
    String.prototype.includes = function (search, start) {
        if (typeof start !== 'number') {
            start = 0;
        }
        if (start + search.length > this.length) {
            return false;
        }
        else {
            return this.indexOf(search, start) !== -1;
        }
    };
}
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.lastIndexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}
class Boot {
    /** @internal */
    constructor() {
        /** @internal */
        this.included = false;
        /** @internal */
        this.loaded = false;
        /** @internal */
        this.requestCount = 0;
        /** @internal */
        this.sources = [];
        /** @internal */
        this.moduleCount = 0;
        /** @internal */
        this.modules = [];
        /** @internal */
        this.requireCount = 0;
        /** @internal */
        this.requires = [];
        if (window["boot"])
            return;
        let me = this;
        window["boot"] = me;
        me.processIncludes();
        window.addEventListener("DOMContentLoaded", () => {
            let script = document.createElement("script");
            script.type = "text/javascript";
            script.onload = () => me.processUses();
            document.body.appendChild(script);
            script.src = this.app();
        });
    }
    /** @internal */
    start() {
        if (this.included && this.loaded) {
            if (typeof window["main"] === "function") {
                console.log("started");
                window["main"]();
            }
        }
    }
    /** @internal */
    processIncludes() {
        var _a, _b;
        let me = this;
        function InvalidTarget(element) {
            let target = element.getAttribute("target-platform");
            if (target == undefined || target.length < 1)
                return false;
            let desktop = typeof window.orientation == "undefined";
            return target == "mobile" ? desktop : !desktop;
        }
        function slice(items) {
            return Array.prototype.slice.call(items);
        }
        function load() {
            me.requestCount--;
            if (me.requestCount == 0)
                me.processIncludes();
        }
        var includes = slice(document.getElementsByTagName("include"));
        me.requestCount += includes.length;
        if (me.requestCount == 0) {
            me.included = true;
            me.start();
            return;
        }
        for (let item of includes) {
            var src = item.getAttribute("src");
            if (src == null)
                break;
            if (src != null && src.endsWith(".css")) {
                (_a = item.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(item);
                if (me.sources.indexOf(src) > -1 || InvalidTarget(item)) {
                    load();
                    continue;
                }
                me.sources.push(src);
                let link = document.createElement("link");
                link.rel = "stylesheet";
                link.type = "text/css";
                link.onload = () => { load(); };
                document.getElementsByTagName("head")[0].appendChild(link);
                link.href = src;
            }
            else if (src && src.endsWith(".js")) {
                (_b = item.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(item);
                if (me.sources.indexOf(src) > -1 || InvalidTarget(item)) {
                    load();
                    continue;
                }
                me.sources.push(src);
                let script = document.createElement("script");
                script.type = "text/javascript";
                script.onload = () => { load(); };
                document.body.appendChild(script);
                script.src = src;
            }
            else {
                let parent = item.parentNode;
                let next = item.nextSibling;
                parent === null || parent === void 0 ? void 0 : parent.removeChild(item);
                me.open(src, (result, includeNode) => {
                    includeNode.innerHTML = result;
                    let nodes = slice(includeNode.children);
                    while (nodes.length) {
                        let node = nodes.shift();
                        if (node)
                            parent === null || parent === void 0 ? void 0 : parent.insertBefore(node, next);
                    }
                    load();
                }, item);
            }
        }
    }
    /** @internal */
    processUses() {
        let me = this;
        function load() {
            me.moduleCount--;
            if (me.moduleCount == 0) {
                me.processsRequires();
            }
        }
        var entries = {
            "ace": {
                "url": "https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.5/ace.js",
                "identifier": "Ace"
            },
            "greensock": {
                "url": "http://cdnjs.cloudflare.com/ajax/libs/gsap/1.19.0/TweenMax.min.js",
                "identifier": "TweenMax"
            },
            "jquery": {
                "url": "https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js",
                "identifier": "jQuery"
            },
            "rivets": {
                "url": "https://cdnjs.cloudflare.com/ajax/libs/rivets/0.9.4/rivets.bundled.min.js",
                "identifier": "rivets"
            },
            "three": {
                "url": "https://cdnjs.cloudflare.com/ajax/libs/three.js/r80/three.min.js",
                "identifier": "THREE"
            }
        };
        me.moduleCount = me.modules.length;
        if (me.moduleCount == 0) {
            me.moduleCount = 1;
            load();
            return;
        }
        for (let key of me.modules) {
            let module = entries[key];
            if (!module || window[module.url] || me.sources.indexOf(module.url) > -1) {
                load();
                continue;
            }
            me.sources.push(module.url);
            let script = document.createElement("script");
            script.type = "text/javascript";
            script.onload = () => { load(); };
            document.body.appendChild(script);
            script.src = module.url;
        }
    }
    /** @internal */
    processsRequires() {
        let me = this;
        function load() {
            me.requireCount--;
            if (me.requireCount == 0) {
                me.loaded = true;
                me.start();
            }
        }
        me.requireCount = me.requires.length;
        if (me.requireCount == 0) {
            me.requireCount = 1;
            load();
            return;
        }
        for (let src of me.requires) {
            if (!src || window[src] || me.sources.indexOf(src) > -1) {
                load();
                continue;
            }
            me.sources.push(src);
            let script = document.createElement("script");
            script.type = "text/javascript";
            script.onload = () => { load(); };
            document.body.appendChild(script);
            script.src = src;
        }
    }
    /** @internal */
    app() {
        var _a;
        let metas = document.getElementsByTagName("meta");
        for (let i = 0; i < metas.length; i++) {
            let meta = metas[i];
            if (meta.getAttribute("name") == "boot")
                return (_a = meta.getAttribute("content")) !== null && _a !== void 0 ? _a : "";
        }
        return "/typescript/build/app.js";
    }
    open(url, onload, state) {
        let request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onload = () => {
            onload(request.response, state);
        };
        request.send();
    }
    require(script) {
        if (this.requires.indexOf(script) < 0)
            this.requires.push(script);
    }
    use(module) {
        let items = Array.isArray(module) ? module : [module];
        for (let item of items)
            if (this.modules.indexOf(item) < 0)
                this.modules.push(item);
    }
}
new Boot();
//# sourceMappingURL=boot.js.map