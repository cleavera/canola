import { IDomElement, IRequest } from '@actoolkit/core';

import { Rank } from '../classes/rank';
import { Score } from '../classes/score';
import { getRequestService } from '../helpers/get-request-service.helper';

export class RankRepository {
    private static readonly PARSER_REGEX: RegExp = /Score: ([0-9,]+) \[([0-9]+)]/;

    public async getOwn(): Promise<Rank> {
        const request: IRequest = getRequestService();
        const response: IDomElement = await request.get('/overview.php');
        const scoreElement: IDomElement = response.querySelector('#game-info-rank-score') ?? this._throwNoScoreInformationFound();

        return this._parseScoreString(scoreElement.textContent ?? this._throwNoScoreInformationFound());
    }

    private _parseScoreString(str: string): Rank {
        const [, scoreString, rankString]: RegExpExecArray = RankRepository.PARSER_REGEX.exec(str) ?? this._throwInvalidScoreString(str);

        const score: number = parseInt(scoreString.replace(/,/g, ''), 10);
        const rank: number = parseInt(rankString, 10);

        return new Rank(new Score(score), rank);
    }

    private _throwInvalidScoreString(str: string): never {
        throw new Error(`Invalid score string '${str}'`);
    }

    private _throwNoScoreInformationFound(): never {
        throw new Error('Could not find score information');
    }
}
