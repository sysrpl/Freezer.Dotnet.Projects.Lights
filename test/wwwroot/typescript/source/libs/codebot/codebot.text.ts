interface String {
    //** Repeat a string count number of times */
    repeat(count: number): string;
    /** Pads the start of a string to fit a length */
    padStart(targetLength: number, padString?: string): string;
    /** Pads the end of a string to fit a length */
    padEnd(targetLength: number, padString?: string): string;
    /** Replace all occurances of search with replacement */
    replaceAll(search: string, replacement: string): string;
    /** Append the String object to the document body. */
    writeLine(): void;
    /** Returns a hash of the string. */
    hashCode(): number;
    /** Returns true if the String object is empty or whitespace. */
    isEmpty(): boolean;
    /** Split a String object into a trimmed array of strings.
     * @param separator String used to separate items (default " ").
     */
    splitTrim(separator?: string): string[];
    /** Format a String object using [n] arguments. */
    format(...args: any[]): string;
    /** Format a String object using [n] arguments. */
    format(...args: any[]): string;
    /** Convert a String object into a DOM element. */
    toElement(): HTMLElement;
}

if (!String.prototype.repeat) {
    String.prototype.repeat = function(count) {
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
    }
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
    }
}

if (!String.prototype.padEnd) {
    String.prototype.padEnd = function padEnd(targetLength, padString) {
        targetLength = targetLength >> 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (this.length > targetLength)
            return String(this);
        targetLength = targetLength - this.length;
        if (targetLength > padString.length)
            padString += padString.repeat(targetLength/padString.length);
        return String(this) + padString.slice(0,targetLength);
    }
}

String.prototype.replaceAll = function(search: string, replacement: string): string {
    return this.split(search).join(replacement);
}

String.prototype.writeLine = function (): void {
    Test.writeLine(this);
}

String.prototype.hashCode = function () {
    let hash = 0;
    if (this.length == 0) return hash;
    for (var i = 0; i < this.length; i++) {
        var character = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + character;
        hash = hash & hash;
    }
    return hash;
}

String.prototype.isEmpty = function () {
    return (this.length === 0 || !this.trim());
}

String.prototype.splitTrim = function (separator?: string): string[] {
    let result: string[] = [];
    let items = this.split(isDefined(separator) ? separator : " ");
    for (let s of items) {
        s = s.trim();
        if (s.length)
            result.push(s)
    }
    return result;
}

String.prototype.format = function (...args: any[]) {
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != "undefined" ? args[number] : match;
    });
}

String.prototype.toElement = function () {
    let block = document.createElement("div");
    block.innerHTML = this;
    return <HTMLElement>block.firstElementChild;
}

interface Number {
    /** Format a number with comma separators. */
    withCommas(): string;
    /** Format a number as bytes. */
    toBytes(): string;
    /** Format a number a hours, minutes, and seconds. */
    toTimeSpan(): string;
}

Number.prototype.withCommas = function () {
    return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");;
}

Number.prototype.toBytes = function () {
    let bytes = Math.floor(this);
    if (bytes < 1) return "0 Bytes";
    var k = 1000;
    var sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

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
    } else {
        let s = seconds.toString();
        if (s.length < 1)
            s = "0" + s;
        return `${minutes}:${s}`;            
    }
}

class Guid {
    value: string;

    constructor() {
        this.value = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    toString(): string {
        return this.value;
    }
}
