import { IDomElement, IRequest } from '@actoolkit/core';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { ArMod } from '../classes/ar-mod';
import { getRequestService } from '../helpers/get-request-service.helper';

export class ArModRepository {
    public async getOwn(): Promise<Maybe<ArMod>> {
        const request: IRequest = getRequestService();
        const response: IDomElement = await request.get('/overview.php');
        const arModTitleCellElement: Maybe<IDomElement> = response.querySelector('#Misc tr:nth-of-type(4) td:nth-of-type(1)') ?? null;
        const arModCellElement: Maybe<IDomElement> = response.querySelector('#Misc tr:nth-of-type(4) td:nth-of-type(2)') ?? null;

        if (!this._hasArMod(arModTitleCellElement, arModCellElement)) {
            return null;
        }

        return ArMod.FromString(arModCellElement.textContent ?? this._throwNoArModInformationFound());
    }

    private _throwNoArModInformationFound(): never {
        throw new Error('Could not find AR modifier information');
    }

    private _hasArMod(arModTitleCellElement: Maybe<IDomElement>, arModCellElement: Maybe<IDomElement>): boolean {
        return !(
            isNull(arModTitleCellElement) || isNull(arModCellElement)
        ) && (arModTitleCellElement.textContent ?? this._throwNoArModInformationFound()).includes('AR Modifier');
    }
}
