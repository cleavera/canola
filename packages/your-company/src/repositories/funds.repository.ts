import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';

import { Funds } from '../classes/funds';

export class FundsRepository {
    private static readonly PARSER_REGEX: RegExp = /Funds: £([0-9,]+)/;

    public async get(): Promise<Funds> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();
        const response: IDomElement = await request.get('/overview.php');
        const fundsElement: IDomElement = response.querySelector('#game-info-funds') ?? this._throwNoFundsInformationFound();

        return this._parseFundsString(fundsElement.textContent ?? this._throwNoFundsInformationFound());
    }

    private _parseFundsString(str: string): Funds {
        const [, fundString]: RegExpExecArray = FundsRepository.PARSER_REGEX.exec(str) ?? this._throwInvalidFundsString(str);

        const funds = parseInt(fundString.replace(/,/g, ''), 10);

        return new Funds(funds);
    }

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }

    private _throwNoFundsInformationFound(): never {
        throw new Error('Could not find funds information');
    }

    private _throwInvalidFundsString(str: string): never {
        throw new Error(`Invalid funds string '${str}'`);
    }
}
