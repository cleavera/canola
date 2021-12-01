import { IDomElement, IRequest } from '@canola/core';

import { ArMod } from '../classes/ar-mod';
import { getRequestService } from '../helpers/get-request-service.helper';

export class ArModRepository {
    public async getOwn(): Promise<ArMod | null> {
        const request: IRequest = getRequestService();
        const response: IDomElement = await request.get('/overview.php');
        const arModTitleCellElement: IDomElement | null = response.querySelector('#Misc tr:nth-of-type(4) td:nth-of-type(1)') ?? null;
        const arModCellElement: IDomElement | null = response.querySelector('#Misc tr:nth-of-type(4) td:nth-of-type(2)') ?? null;

        if (!this._hasArMod(arModTitleCellElement, arModCellElement)) {
            return null;
        }

        return ArMod.FromString(arModCellElement.textContent ?? this._throwNoArModInformationFound());
    }

    private _throwNoArModInformationFound(): never {
        throw new Error('Could not find AR modifier information');
    }

    private _hasArMod(arModTitleCellElement: IDomElement | null, arModCellElement: IDomElement | null): boolean {
        return !(
            arModTitleCellElement === null || arModCellElement === null
        ) && (arModTitleCellElement.textContent ?? this._throwNoArModInformationFound()).includes('AR Modifier');
    }
}
