export const RATE_GROUPS = [
    { icon: '❌', from: 0, to: 1 },
    { icon: '👎', from: 1, to: 80 },
    { icon: '👍', from: 80, to: 90 },
    { icon: '👌', from: 90, to: 99 },
    { icon: '🔥', from: 99, to: 100 },
];

export class RateGroup {
    public icon: string;
    public from: number;
    public to: number;

    constructor(init?: Partial<RateGroup>) {
        Object.assign(this, init);
    }

    public label(): string {
        return `${this.icon} ${this.from}–${this.to}%`;
    }

    public static from(rate: number): RateGroup {
        const group = RATE_GROUPS.find(g => rate >= g.from && (rate < g.to || (rate >= 100 && g.to === 100)));
        return new RateGroup(group);
    }
}

export function formatRate(rate: number): string {
    rate *= 100;
    return isNaN(rate) ? '?' : `${RateGroup.from(rate).icon} ${rate.toFixed(1)}%`;
}
