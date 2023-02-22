type DynamoDBEvent = {
    payload: {
        S: string;
    };
    metadata: {
        S: string;
    };
};

type BaseEventPayload = {
    type: string;
    data: {
        id: string;
        version: number;
    };
};

type BaseEventMetadata = {
    idempotencyKey: string;
};

type ThinEvent = {
    payload: {
        type: string;
        data: {
            id: string;
            version: number;
        };
    };
    metadata: BaseEventMetadata;
};

export const handler = async (events: Array<DynamoDBEvent>): Promise<Array<ThinEvent>> => {
    console.log(events);
    const thinEvents = events.map( (dynamodbEvent: DynamoDBEvent) => {
        const parsedPayload = JSON.parse(dynamodbEvent.payload.S) as BaseEventPayload;
        const parsedMetadata = JSON.parse(dynamodbEvent.metadata.S) as BaseEventMetadata;
        return {
            payload: {
                type: parsedPayload.type,
                data: {
                    id: parsedPayload.data.id,
                    version: parsedPayload.data.version,
                },
            },
            metadata: {
                idempotencyKey: parsedMetadata.idempotencyKey,
            },
        };
    });
    return thinEvents;
};
