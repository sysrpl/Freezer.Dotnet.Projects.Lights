/** LocalCache is used by the WebRequest object to capture responses.*/
class LocalCache {
    private data = {};

    remove(url: string): void {
        delete this.data[url];
    }

    exists(url: string): boolean {
        return this.data.hasOwnProperty(url) && isDefined(this.data[url]);
    }

    recall(url: string): string {
        return this.data[url];
    }

    store(url: string, value: string): void {
        this.data[url] = value;
    }
}

/** WebRequest handles asynchronous http 'get' and 'post' requests. */
class WebRequest {
    private localCache: LocalCache;
    private httpRequest: XMLHttpRequest;
    private cache: boolean;
    private succcessCallback: WebRequestCallback;
    private errorCallback: WebRequestCallback;

    private sendComplete(data?: string) {
        this.responseText = undefined;
        this.responseBytes = undefined;
        if (this.requestType == "arraybuffer" || this.requestType == "blob")
            this.responseBytes = new Uint8Array(this.httpRequest.response);
        else if (this.requestType == "document")
            this.responseXML = this.httpRequest.responseXML;
        else
        {
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

    private httpRequestLoad() {
        let code = this.httpRequest.status;
        if (code > 199 && code < 300)
            this.sendComplete();
        else if (this.errorCallback)    
            this.errorCallback(this);
    }

    private httpRequestError() {
        if (this.errorCallback)
            this.errorCallback(this);
    }

    constructor(requestType: XMLHttpRequestResponseType = "text") {
        this.requestType = requestType;
        this.localCache = new LocalCache();
        this.httpRequest = new XMLHttpRequest();
        this.httpRequest.responseType = requestType;
        this.httpRequest.onload = () => this.httpRequestLoad();
        this.httpRequest.onerror = () => this.httpRequestError();
        this.succcessCallback = null;
        this.errorCallback = null;
    }

    public set onsuccess(handler: WebRequestCallback) {
        this.succcessCallback = handler;
    }

    public set onerror(handler: WebRequestCallback) {
        this.errorCallback = handler;
    }

    public get status(): number {
        return this.httpRequest.status;
    }

    /** The endpoint of the last send or post operation. */
    url: string;

    /** The format of data expected as a result */
    requestType: XMLHttpRequestResponseType;

    /** After send completes successfully the response in a byte array. */
    responseBytes: Uint8Array;

    /** After send completes successfully the response in a string. */
    responseText: string;

    /** After send completes successfully the response in an XML document. */
    responseXML: Document;

    /** After send completes successfully the response in a javascript object. */
    get responseJSON(): any {
        return JSON.parse(this.responseText);
    }

    /** Perform an asynchronous http get request.
     * @param url The endpoint for the requested resource.
     * @param onsuccess Your notification invoked after request completes successfully.
     * @param cache When cache is true responses are reused for each distinct url. 
     */
    send(url: string, onsuccess?: WebRequestCallback, onerror?: WebRequestCallback, cache?: boolean): void {
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

    /** Perform an asynchronous http post request.
     * @param url The endpoint for the requested resource.
     * @param data Data posted to recipient enpoint.
     */
    post(url: string, data: FormData | String | Object, onsuccess?: WebRequestCallback, 
        onerror?: WebRequestCallback, cache?: boolean): void {
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

    /** Cancel any pending send or post operations.
     * @param url The endpoint for the requested resource.
     * @param data Data posted to recipient enpoint.
     */
    cancel(): void {
        this.httpRequest.abort();
    }
}

/** RequestCallback is the type used to notify you when send completes duccessfully. */
type WebRequestCallback = (request: WebRequest) => void;

/** Perform a one off asynchronous http get request.
 * @param url The endpoint for the requested resource.
 * @param succcess Optional notification invoked when the request loads.
 */
function sendWebRequest(url: string, onsuccess?: WebRequestCallback, onerror?: WebRequestCallback) {
    let r = new WebRequest();
    r.send(url, onsuccess, onerror);
}

/** Perform a one off asynchronous http get request.
 * @param url The endpoint for the requested resource.
 * @param requestType The type of data requested.
 * @param onsuccess Optional notification invoked when the request loads.
 */
function sendWebRequestType(url: string, requestType: XMLHttpRequestResponseType,
    onsuccess?: WebRequestCallback, onerror?: WebRequestCallback) {
    let r = new WebRequest(requestType);
    r.send(url, onsuccess, onerror);
}

/** Perform a one off asynchronous http post request.
 * @param url The endpoint for the requested resource.
 * @param data A string or object posted to the enpoint.
 * @param onsuccess Optional notification invoked when the request loads.
 */
function postWebRequest(url: string, data: FormData | String | Object,
    onsuccess?: WebRequestCallback, onerror?: WebRequestCallback) {
    let r = new WebRequest();
    r.post(url, data, onsuccess, onerror);
}

/** Perform a one off asynchronous http post request.
 * @param url The endpoint for the requested resource.
 * @param data A string or object posted to the enpoint.
 * @param requestType The type of data requested.
 * @param onsuccess Optional notification invoked when the request loads.
 */
function postWebRequestType(url: string, data: FormData | String | Object,
    requestType: XMLHttpRequestResponseType, onsuccess?: WebRequestCallback,
    onerror?: WebRequestCallback) {
    let r = new WebRequest(requestType);
    r.post(url, data, onsuccess, onerror);
}

/** Copies an object's enumerable properties into a FormData object.
 * @param obj An object with enumerable properties.
 * @returns A FormData object populated with values.
 */
function objectToFormData(obj: Object): FormData {
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

/** Perform a sumbit of a form using an XMLHttpRequest
 * @param form The HTMLFormElelemnt to submit.
 * @param prepare An option callback to prepare the request before it's sent.
 * @return The XMLHttpRequest object already sent.  
 */
function formSubmit(form: HTMLFormElement, prepare?: Action<XMLHttpRequest>): XMLHttpRequest {
    let formData = new FormData(form);
    let request = new XMLHttpRequest();
    if (prepare)
        prepare(request);
    request.open(form.getAttribute("method"), form.getAttribute("action"), true);
    request.send(formData);
    return request;
}