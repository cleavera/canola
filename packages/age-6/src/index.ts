import { INJECTOR, IRequest, REQUEST } from '@actoolkit/core';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

export async function age6ContentScript(): Promise<void> {
    const request: Maybe<IRequest> = INJECTOR.get<IRequest>(REQUEST);

    if (isNull(request)) {
        throw new Error('No request strategy registered');
    }

    const response: string = await request.get('/overview.php');

    console.log(response); // eslint-disable-line no-console
}
