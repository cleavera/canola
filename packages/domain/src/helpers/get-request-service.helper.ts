import { INJECTOR, IRequest, REQUEST } from '@actoolkit/core';

function _throwNoRequestStrategy(): never {
    throw new Error('No request strategy registered');
}

export function getRequestService(): IRequest {
    return INJECTOR.get<IRequest>(REQUEST) ?? _throwNoRequestStrategy();
}
