import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';

import { Score } from '../classes/score';

export class ScoreRepository {
    private static readonly PARSER_REGEX: RegExp = /Score: ([0-9,]+) \[([0-9]+)]/;

    public async get(): Promise<Score> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();
        const response: IDomElement = await request.get('/overview.php');
        const scoreElement: IDomElement = response.querySelector('#game-info-rank-score') ?? this._throwNoScoreInformationFound();

        return this._parseScoreString(scoreElement.textContent ?? this._throwNoScoreInformationFound());
    }

    private _parseScoreString(str: string): Score {
        const [, scoreString, rankString]: RegExpExecArray = ScoreRepository.PARSER_REGEX.exec(str) ?? this._throwInvalidScoreString(str);

        const score = parseInt(scoreString.replace(/,/g, ''), 10);
        const rank = parseInt(rankString, 10);

        return new Score(score, rank);
    }

    private _throwInvalidScoreString(str: string): never {
        throw new Error(`Invalid score string '${str}'`);
    }

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }

    private _throwNoScoreInformationFound(): never {
        throw new Error('Could not find score information');
    }
}
