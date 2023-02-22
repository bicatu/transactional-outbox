import { authorize, AuthorizedOrderPayment, capture, CapturedOrderPayment, OrderPayment, refund } from './OrderPayment';
import { randomUUID } from 'crypto';
import { OrderPaymentEvent } from './Event';
import { OrderPaymentRepository } from './OrderPaymentRepository';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const events: Array<OrderPaymentEvent> = [];
let ret: { orderPayment: OrderPayment; event: OrderPaymentEvent };

const id = randomUUID();
ret = authorize(id, 10.0);
events.push(ret.event);
console.log(ret.orderPayment);

ret = capture(ret.orderPayment as AuthorizedOrderPayment, 10.0);
events.push(ret.event);
console.log(ret.orderPayment);

ret = refund(ret.orderPayment as CapturedOrderPayment, 10.0);
events.push(ret.event);
console.log(ret.orderPayment);

console.log(events);

const repository = new OrderPaymentRepository(
    new DynamoDBClient({}),
    'transactional-outbox-orders',
    'transactional-outbox-order-events',
);

(async () => {
    await repository.save(ret.orderPayment, events);
})();
