import { TransactWriteItemsCommand, GetItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { OrderPaymentEvent } from './Event';
import { OrderPayment } from './OrderPayment';

export class OrderPaymentRepository {
    constructor(
        private readonly dbClient: DynamoDBClient,
        private readonly ordersTable: string,
        private readonly orderEventsTable: string,
    ) {}

    public async save(orderPayment: OrderPayment, events: Array<OrderPaymentEvent>): Promise<void> {
        const Pk = `PAYMENT_ORDER#${orderPayment.id}`;

        const command = new TransactWriteItemsCommand({
            TransactItems: [
                {
                    Update: {
                        TableName: this.ordersTable,
                        Key: {
                            PK: { S: Pk },
                        },
                        UpdateExpression: 'SET #state = :state, #version = :version',
                        ConditionExpression:
                            '(attribute_exists(#version) and #version = :oldVersion) or attribute_not_exists(#version)',
                        ExpressionAttributeNames: {
                            '#state': 'state',
                            '#version': 'version',
                        },
                        ExpressionAttributeValues: {
                            ':state': {
                                S: JSON.stringify(orderPayment),
                            },
                            ':version': {
                                N: orderPayment.version.toString(),
                            },
                            ':oldVersion': {
                                N:
                                    orderPayment.version > 0
                                        ? (orderPayment.version - events.length).toString()
                                        : orderPayment.version.toString(),
                            },
                        },
                    },
                },
            ],
        });

        events.forEach((event) => {
            command.input.TransactItems?.push({
                Put: {
                    TableName: this.orderEventsTable,
                    Item: {
                        PK: { S: Pk },
                        SK: { N: event.data.version.toString() },
                        payload: { S: JSON.stringify(event) },
                        metadata: {
                            S: JSON.stringify({
                                idempotencyKey: `${Pk}#${event.data.version}`,
                            }),
                        },
                    },
                },
            });
        });

        try {
            await this.dbClient.send(command);
        } catch (e) {
            console.log(e);
        }
    }

    public async findById(orderId: string): Promise<OrderPayment | null> {
        const command = new GetItemCommand({
            TableName: this.ordersTable,
            Key: {
                PK: { S: `PAYMENT_ORDER#${orderId}` },
            },
        });

        const response = await this.dbClient.send(command);
        if (response.Item) {
            return JSON.parse(unmarshall(response.Item).state);
        } else {
            return null;
        }
    }
}
