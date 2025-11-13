type Handler = (...args: any[]) => void;
type EventMap = { [eventName: string]: Handler[] };

interface NotifyArgs {
    sender: object
};

class EventManager {
    private events: EventMap = {};

    public addEventListener(name: string, handler: Handler): () => void {
        if (!this.events[name])
            this.events[name] = [];
        this.events[name].push(handler);
        return () =>
            this.events[name] = this.events[name].filter(h => h !== handler);
    }

    protected notify(eventName: string, ...args: any[]): void {
        const handlers = this.events[eventName] || [];
        for (const handler of handlers)
            handler(...args);
    }
}

type AnyAction = Action<any>;

interface NamedAction {
    name: string;
    onconnect: Proc | null,
    onmessage: AnyAction | null;
}

interface Message {
    name: string;
    payload: any;
}

class Messages {
    private static items: NamedAction[] = [];

    private static notifyConnect() {
        for (const i of Messages.items)
            i.onconnect?.();
    }

    private static notifyMessage(m: Message) {
        for (const i of Messages.items)
            if (i.name == m.name)
                i.onmessage?.(m.payload);
    }

    public static subscribe(name: string, onconnect: Proc | null, onmessage: AnyAction | null) {
        Messages.items.push({ "name": name, "onconnect": onconnect, "onmessage": onmessage });
    }

    public static connect(endpoint: string) {
        subscribeEvent(endpoint, Messages.notifyConnect, Messages.notifyMessage);
    }
}
