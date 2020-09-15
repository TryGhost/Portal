import CalculateDiscount from './discount';

export function getMemberSubscription({member = {}}) {
    if (member.paid) {
        const [subscription] = member.subscriptions || [];
        return subscription;
    }
    return null;
}

export function isMemberComplimentary({member = {}}) {
    const subscription = getMemberSubscription({member});
    if (subscription) {
        const {plan} = subscription;
        return (plan.nickname === 'Complimentary');
    }
    return false;
}

export function isPaidMember({member = {}}) {
    return (member && member.paid);
}

export function getSitePlans({site = {}}) {
    const {plans} = site;
    const discount = CalculateDiscount(plans.monthly, plans.yearly);
    return [
        {
            type: 'month',
            price: plans.monthly,
            currency: plans.currency_symbol,
            name: 'Monthly'
        },
        {
            type: 'year',
            price: plans.yearly,
            currency: plans.currency_symbol,
            name: 'Yearly',
            discount
        }
    ];
}
