import msgHeader from '../helpers/msg-header';
import { RateGroup } from './format';

interface MessageContext {
    network: string;
    title: string;
    fromEpoch: number;
    toEpoch: number;
}

interface MessageField {
    name: string;
    value: string;
}

export function createMessage(context: MessageContext, ...fields: Array<MessageField>): object {
    return {
        ...msgHeader,
        title: `${process.env.ENV} -> ${context.network} -> ${context.title}`,
        fields
    };
}

export function createStandardMessage(context: MessageContext, ...fields: Array<MessageField>): object {
    fields = [...fields];
    if (context.fromEpoch) {
        fields.push({
            name: 'Epochs',
            value: `${context.fromEpoch} – ${context.toEpoch}`
        });
    }
    return createMessage(context, ...fields);
}

export function createAverageRatesMessage(context: MessageContext, rates: Array<number>): object {
    // Collect validator rates into groups
    const groups = rates.reduce((aggr, rate) => {
        rate = Math.round(rate * 100);
        const groupLabel = RateGroup.from(rate).label();
        aggr[groupLabel] = aggr[groupLabel] || { validators: 0, sum: 0 };
        aggr[groupLabel].validators++;
        aggr[groupLabel].sum += rate;
        return aggr;
    }, {});

    // Create a MessageField for each group
    const fields = Object.keys(groups)
        .map(key => {
            const group = groups[key];
            const avg = group.sum / group.validators;
            return {
                field: {
                    name: key,
                    value: `Validators: ${group.validators}, Average: ${(avg).toFixed(1)}%`
                },
                order: avg
            };
        })
        .sort((a, b) => b.order - a.order) // Sort by rate descending
        .map(v => v.field); // Discard 'order' property

    return createStandardMessage(context, ...fields);
}