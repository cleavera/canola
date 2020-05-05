import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';

import { Score } from '../classes/score';

export class ScoreRepository {
    public async get(): Promise<Score> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();
        const response: IDomElement = await request.get('/overview.php');
        const scoreElement: IDomElement = response.querySelector('#game-info-rank-score') ?? this._throwNoScoreInformationFound();

        return Score.FromString(scoreElement.textContent ?? this._throwNoScoreInformationFound());
    }

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }

    private _throwNoScoreInformationFound(): never {
        throw new Error('Could not find score information');
    }
}
