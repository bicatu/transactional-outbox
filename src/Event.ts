export type PaymentAuthorized = Readonly<{
    type: 'PaymentAuthorized';
    data: {
        id: string;
        authorizedAmount: number;
        authorizedAt: string;
        version: number;
    };
}>;

export type PaymentCaptured = Readonly<{
    type: 'PaymentCaptured';
    data: {
        id: string;
        capturedAmount: number;
        capturedAt: string;
        version: number;
    };
}>;

export type PaymentRefunded = Readonly<{
    type: 'PaymentRefunded';
    data: {
        id: string;
        refundedAmount: number;
        refundedAt: string;
        version: number;
    };
}>;

export type PaymentVoided = Readonly<{
    type: 'PaymentVoided';
    data: {
        id: string;
        voidedAt: string;
        version: number;
    };
}>;

export type OrderPaymentEvent = PaymentAuthorized | PaymentCaptured | PaymentRefunded | PaymentVoided;
