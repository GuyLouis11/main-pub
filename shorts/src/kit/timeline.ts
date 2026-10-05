// Word-level timeline (written by tools/vo.py). Every beat is placed on a spoken word, never on a hard-coded second.
export type Word = {w: string; s: number; e: number; hi: boolean};
export type Line = {id: string; start: number; end: number; text: string; words: Word[]};
export type Timeline = {title: string; fps: number; total: number; lines: Line[]};

export const makeT = (tl: Timeline) => {
  const fps = tl.fps;
  const byId: Record<string, Line> = {};
  tl.lines.forEach((l) => (byId[l.id] = l));
  const line = (id: string) => {
    const l = byId[id];
    if (!l) throw new Error('no line ' + id);
    return l;
  };
  const f = (sec: number) => Math.round(sec * fps);
  return {
    fps,
    total: tl.total,
    frames: Math.ceil(tl.total * fps),
    lines: tl.lines,
    f,
    /** frame where word k of line id starts (k < 0 counts from the end) */
    w: (id: string, k: number, off = 0) => {
      const ws = line(id).words;
      const i = k < 0 ? ws.length + k : Math.min(k, ws.length - 1);
      return f(ws[i].s + off);
    },
    /** frame where word k of line id ends */
    we: (id: string, k: number, off = 0) => {
      const ws = line(id).words;
      const i = k < 0 ? ws.length + k : Math.min(k, ws.length - 1);
      return f(ws[i].e + off);
    },
    /** first word whose text starts with `prefix` (case-insensitive), from word `from` */
    find: (id: string, prefix: string, from = 0, off = 0) => {
      const ws = line(id).words;
      const i = ws.findIndex((x, j) => j >= from && x.w.toLowerCase().replace(/[^a-z0-9$-]/g, '').startsWith(prefix.toLowerCase()));
      if (i < 0) throw new Error(`word "${prefix}" not in ${id}`);
      return f(ws[i].s + off);
    },
    ls: (id: string, off = 0) => f(line(id).start + off),
    le: (id: string, off = 0) => f(line(id).end + off),
  };
};
export type T = ReturnType<typeof makeT>;
