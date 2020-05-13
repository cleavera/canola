import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';

import { BaseTech } from '../classes/base-tech';
import { BaseTechnologies } from '../classes/base-technologies';
import { Funds } from '../classes/funds';
import { Ticks } from '../classes/ticks';

export class BaseTechnologiesRepository {
    public async get(): Promise<BaseTechnologies> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();
        const response: IDomElement = await request.get('/manual/techs.php');
        const mainPageElement: IDomElement = response.querySelector('#main-page-data') ?? this._throwNoTechInformationFound();
        const techTable: IDomElement = mainPageElement.querySelector('table') ?? this._throwNoTechInformationFound();

        return this._parseTechTable(techTable);
    }

    private _parseTechTable(table: IDomElement): BaseTechnologies {
        const rows: ArrayLike<IDomElement> = table.querySelectorAll('tr') ?? this._throwNoTechInformationFound();
        const techs: Array<BaseTech> = [];

        for (let i = 6; i < rows.length; i += 3) {
            if ((rows[i].textContent?.trim() ?? '') === '') { // Handle the section dividers
                i++;

                continue;
            }

            techs.push(this._parseTechRow(rows[i]));
        }

        return new BaseTechnologies(techs);
    }

    private _parseTechRow(row: IDomElement): BaseTech {
        const cells: ArrayLike<IDomElement> = row.querySelectorAll('td') ?? this._throwNoTechInformationFound();
        const name: string = cells[0].textContent ?? this._throwNoTechInformationFound();
        const timeString: string = cells[1].textContent ?? this._throwNoTechInformationFound();
        const costString: string = cells[2].textContent ?? this._throwNoTechInformationFound();

        return new BaseTech(name.trim(), Ticks.FromString(timeString), Funds.FromString(costString));
    }

    private _throwNoTechInformationFound(): never {
        throw new Error('No tech information found');
    }

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }
}
