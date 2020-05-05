import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';

import { Company } from '../classes/company';

export class CompanyRepository {
    public async getCompany(): Promise<Company> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();

        const response: IDomElement = await request.get('/overview.php');

        const companyElement: IDomElement = response.querySelector('#game-info-company') ?? this._throwNoCompanyInformationFound();

        return Company.FromString(companyElement.textContent ?? this._throwNoCompanyInformationFound());
    }

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }

    private _throwNoCompanyInformationFound(): never {
        throw new Error('Could not find company information');
    }
}
