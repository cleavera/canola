import { IDomElement, IRequest } from '@canola/core';

import { Funds } from '../classes/funds';
import { getRequestService } from '../helpers/get-request-service.helper';

export class FundsRepository {
    private static readonly PARSER_REGEX: RegExp = /Funds: (£[0-9,]+)/;

    public async getOwn(): Promise<Funds> {
        const request: IRequest = getRequestService();
        const response: IDomElement = await request.get('/overview.php');
        const fundsElement: IDomElement = response.querySelector('#game-info-funds') ?? this._throwNoFundsInformationFound();

        return this._parseFundsString(fundsElement.textContent ?? this._throwNoFundsInformationFound());
    }

    private _parseFundsString(str: string): Funds {
        const [, fundString]: RegExpExecArray = FundsRepository.PARSER_REGEX.exec(str) ?? this._throwInvalidFundsString(str);

        return Funds.FromString(fundString);
    }

    private _throwNoFundsInformationFound(): never {
        throw new Error('Could not find funds information');
    }

    private _throwInvalidFundsString(str: string): never {
        throw new Error(`Invalid funds string '${str}'`);
    }
}
