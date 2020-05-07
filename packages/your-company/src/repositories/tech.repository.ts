import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { Development } from '../classes/development';
import { Funds } from '../classes/funds';
import { Tech } from '../classes/tech';
import { Ticks } from '../classes/ticks';
import { DevelopmentType } from '../constants/development-type.constant';

export class TechRepository {
    private static readonly PROGRESS_REGEX: RegExp = / complete, ETA ([0-9,]+)\./

    public async get(): Promise<Tech> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();
        const response: IDomElement = await request.get('/development.php');
        const mainPageElement: IDomElement = response.querySelector('#main-page-data') ?? this._throwNoDevelopmentInformationFound();
        const developmentTable: IDomElement = mainPageElement.querySelector('table') ?? this._throwNoDevelopmentInformationFound();

        return this._parseDevelopmentsTable(developmentTable);
    }

    private _parseDevelopmentsTable(developmentTable: IDomElement): Tech {
        const rows: ArrayLike<IDomElement> = developmentTable.querySelectorAll('tr');
        let type: DevelopmentType = DevelopmentType.RESEARCH;
        const developments: Array<Development> = [];

        for (let x = 2; x < rows.length; x += 2) {
            const cells: ArrayLike<IDomElement> = rows[x].querySelectorAll('td');

            if (cells.length === 1) {
                type = DevelopmentType.CONSTRUCTION;

                continue;
            }

            const name: string = cells[0].textContent ?? this._throwInvalidDevelopmentName();
            const ticks: Ticks = Ticks.FromString(cells[1].textContent ?? this._throwInvalidDevelopment(name));

            developments.push(new Development(
                name.trim(),
                ticks,
                Funds.FromString(cells[3].textContent ?? this._throwInvalidDevelopment(name)),
                type,
                this.getProgress(cells[4].textContent ?? this._throwInvalidDevelopment(name), ticks)
            ));
        }

        return new Tech(developments);
    }

    private getProgress(progressString: string, totalTicks: Ticks): Maybe<Ticks> {
        if (progressString.trim() === 'Complete') {
            return totalTicks;
        }

        const match: Maybe<RegExpExecArray> = TechRepository.PROGRESS_REGEX.exec(progressString);

        if (isNull(match)) {
            return null;
        }

        const remaining: Ticks = Ticks.FromString(match[1]);

        return Ticks.Subtract(totalTicks, remaining);
    }

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }

    private _throwNoDevelopmentInformationFound(): never {
        throw new Error('Could not find funds information');
    }

    private _throwInvalidDevelopment(name: string): never {
        throw new Error(`Could not parse development named ${name}`);
    }

    private _throwInvalidDevelopmentName(): never {
        throw new Error('Could not parse development name');
    }
}
