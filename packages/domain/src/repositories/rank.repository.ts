import { IDomElement, IRequest } from '@actoolkit/core';

import { Rank } from '../classes/rank';
import { Score } from '../classes/score';
import { getRequestService } from '../helpers/get-request-service.helper';

export class RankRepository {
    private static readonly PARSER_REGEX: RegExp = /Score: ([0-9,]+) \[([0-9]+)]/;

    private readonly _request: IRequest;

    constructor() {
        this._request = getRequestService();
    }

    public async getOwn(): Promise<Rank> {
        const response: IDomElement = await this._request.get('/overview.php');
        const scoreElement: IDomElement = response.querySelector('#game-info-rank-score') ?? this._throwNoScoreInformationFound();

        return this._parseScoreString(scoreElement.textContent ?? this._throwNoScoreInformationFound());
    }

    public async getForId(id: string): Promise<Rank> {
        const response: IDomElement = await this._request.get(`/id_view.php?ID=${id}`);
        const mainPageElement: IDomElement = response.querySelector('#main-page-data') ?? this._throwNoScoreInformationFound();
        const playerInformationTable: IDomElement = mainPageElement.querySelector('table:nth-of-type(3)') ?? this._throwNoScoreInformationFound();
        const [, scoreRow, rankRow]: Array<IDomElement> = Array.from(playerInformationTable.querySelectorAll('tr'));

        return new Rank(new Score(this._getValueCell(scoreRow)), this._getValueCell(rankRow));
    }

    private _parseScoreString(str: string): Rank {
        const [, scoreString, rankString]: RegExpExecArray = RankRepository.PARSER_REGEX.exec(str) ?? this._throwInvalidScoreString(str);

        const score: number = this._parseValue(scoreString);
        const rank: number = this._parseValue(rankString);

        return new Rank(new Score(score), rank);
    }

    private _getValueCell(row: IDomElement): number {
        const [, valueCell]: Array<IDomElement> = Array.from(row.querySelectorAll('td'));

        return this._parseValue(valueCell.textContent ?? this._throwNoScoreInformationFound());
    }

    private _parseValue(str: string): number {
        return parseInt(str.replace(/,/g, ''), 10);
    }

    private _throwInvalidScoreString(str: string): never {
        throw new Error(`Invalid score string '${str}'`);
    }

    private _throwNoScoreInformationFound(): never {
        throw new Error('Could not find score information');
    }
}
