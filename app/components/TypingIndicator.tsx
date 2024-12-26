'use client'

export class TypingSet {
  active: Record<string, number>;
  interval: number = 1000;

  _refresher: (names: string[]) => void;
  _watchId: any;

  constructor(refresh: (names: string[]) => void) {
    this.active = {};
    this._refresher = refresh;
  }

  get names() {
    return Object.keys(this.active);
  }

  add(name: string) {
    this.active[name] = Date.now();
    this._watch();
    this._refresher(this.names);
  }

  remove(name: string) {
    delete this.active[name];

    if (Object.keys(this.active).length === 0) {
      this.unwatch();
    }

    this._refresher(this.names);
  }

  unwatch() {
    if (this._watchId) {
      clearInterval(this._watchId);
      delete this._watchId;
    }
  }

  _watch() {
    if (this._watchId) return;

    this._watchId = setInterval(() => {
      let now = Date.now();
      let needsRefresh = false;

      for (let name of Object.keys(this.active)) {
        let deadline = this.active[name] + this.interval;

        console.log(this.active, this.interval, name, deadline, now);
        if (deadline < now) {
          delete this.active[name];
          needsRefresh = true;
        }
      }

      if (Object.keys(this.active).length === 0) {
        this.unwatch();
      }

      if (needsRefresh) {
        this._refresher(this.names);
      }
    }, this.interval);
  }
}

export const TypingIndicator = (props: { names: Array<string> }) => {
  let names = props.names;

  if (names.length === 0) return null;

  let prefix;

  if (names.length > 1) {
    prefix = `${names.length} folks are`;
  } else {
    prefix = `${names[0]} is`;
  }

  return (
    <div className="px-2 text-xs text-gray-400">{`${prefix} typing...`}</div>
  );
};
