import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';
import { Score } from '../classes/score';

export class ScoreRepository {
    public async get(): Promise<Score> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();
        const response: IDomElement = await request.get('/overview.php');
        const companyElement: IDomElement = response.querySelector('#game-info-rank-score') ?? this._throwNoCompanyInformationFound();

        return Score.FromString(companyElement.textContent ?? this._throwNoCompanyInformationFound());
    }

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }

    private _throwNoCompanyInformationFound(): never {
        throw new Error('Could not find company information');
    }
}
