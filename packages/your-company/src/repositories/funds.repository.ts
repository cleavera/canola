import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';

import { Funds } from '../classes/funds';

export class FundsRepository {
    public async get(): Promise<Funds> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();
        const response: IDomElement = await request.get('/overview.php');
        const fundsElement: IDomElement = response.querySelector('#game-info-funds') ?? this._throwNoFundsInformationFound();

        return Funds.FromString(fundsElement.textContent ?? this._throwNoFundsInformationFound());
    }

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }

    private _throwNoFundsInformationFound(): never {
        throw new Error('Could not find funds information');
    }
}
