import { IDomElement, IRequest } from '@canola/core';

import { CompanyName } from '../classes/company-name';
import { getRequestService } from '../helpers/get-request-service.helper';

export class CompanyNameRepository {
    public async getOwn(): Promise<CompanyName> {
        const request: IRequest = getRequestService();
        const response: IDomElement = await request.get('/overview.php');
        const companyElement: IDomElement = response.querySelector('#game-info-company') ?? this._throwNoCompanyInformationFound();

        return CompanyName.FromString(companyElement.textContent ?? this._throwNoCompanyInformationFound());
    }

    private _throwNoCompanyInformationFound(): never {
        throw new Error('Could not find company information');
    }
}
