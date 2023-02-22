import { PaymentAuthorized, PaymentCaptured, PaymentRefunded, PaymentVoided } from './Event';

export type AuthorizedOrderPayment = {
    id: string;
    version: number;
    status: 'AUTHORIZED';
    authorizedAmount: number;
    authorizedAt: string;
};

export type CapturedOrderPayment = {
    id: string;
    version: number;
    status: 'CAPTURED';
    authorizedAmount: number;
    authorizedAt: string;
    capturedAmount: number;
    capturedAt: string;
};

export type RefundedOrderPayment = {
    id: string;
    version: number;
    status: 'REFUNDED';
    authorizedAmount: number;
    authorizedAt: string;
    capturedAmount: number;
    capturedAt: string;
    refundedAmount: number;
    refundedAt: string;
};

export type VoidedOrderPayment = {
    id: string;
    version: number;
    status: 'VOIDED';
    authorizedAmount: number;
    authorizedAt: string;
    voidedAt: string;
};

export type OrderPayment = AuthorizedOrderPayment | CapturedOrderPayment | RefundedOrderPayment | VoidedOrderPayment;

export const authorize = (
    orderId: string,
    amount: number,
): { orderPayment: AuthorizedOrderPayment; event: PaymentAuthorized } => {
    const orderPayment: AuthorizedOrderPayment = {
        id: orderId,
        authorizedAmount: amount,
        authorizedAt: currentJsonDate(),
        status: 'AUTHORIZED',
        version: 0,
    };

    return {
        orderPayment,
        event: {
            type: 'PaymentAuthorized',
            data: orderPayment,
        },
    };
};

export const capture = (
    currentOrderPayment: AuthorizedOrderPayment,
    amount: number,
): { orderPayment: CapturedOrderPayment; event: PaymentCaptured } => {
    const orderPayment: CapturedOrderPayment = {
        id: currentOrderPayment.id,
        version: currentOrderPayment.version + 1,
        authorizedAmount: currentOrderPayment.authorizedAmount,
        authorizedAt: currentOrderPayment.authorizedAt,
        capturedAmount: amount,
        capturedAt: currentJsonDate(),
        status: 'CAPTURED',
    };

    return {
        orderPayment,
        event: {
            type: 'PaymentCaptured',
            data: orderPayment,
        },
    };
};

export const refund = (
    currentOrderPayment: CapturedOrderPayment,
    amount: number,
): { orderPayment: RefundedOrderPayment; event: PaymentRefunded } => {
    // The business invariants
    if (amount > currentOrderPayment.capturedAmount) {
        throw new Error('I will not refund more than I captured');
    }

    const orderPayment: RefundedOrderPayment = {
        id: currentOrderPayment.id,
        version: currentOrderPayment.version + 1,
        authorizedAmount: currentOrderPayment.authorizedAmount,
        authorizedAt: currentOrderPayment.authorizedAt,
        capturedAmount: currentOrderPayment.capturedAmount,
        capturedAt: currentOrderPayment.capturedAt,
        refundedAmount: amount,
        refundedAt: currentJsonDate(),
        status: 'REFUNDED',
    };

    return {
        orderPayment,
        event: {
            type: 'PaymentRefunded',
            data: orderPayment,
        },
    };
};

export const voidPayment = (
    currentOrderPayment: AuthorizedOrderPayment,
): { orderPayment: VoidedOrderPayment; event: PaymentVoided } => {
    const orderPayment: VoidedOrderPayment = {
        id: currentOrderPayment.id,
        version: currentOrderPayment.version + 1,
        authorizedAmount: currentOrderPayment.authorizedAmount,
        authorizedAt: currentOrderPayment.authorizedAt,
        voidedAt: currentJsonDate(),
        status: 'VOIDED',
    };

    return {
        orderPayment,
        event: {
            type: 'PaymentVoided',
            data: orderPayment,
        },
    };
};

const currentJsonDate = (): string => {
    return new Date().toJSON();
};
