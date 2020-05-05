import { INJECTOR, IRequest, REQUEST } from '@actoolkit/core';

import { Company } from '../classes/company';

export class CompanyRepository {
    public async getCompany(): Promise<Company> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();

        const response: string = await request.get('/overview.php');

        return Company.FromString(response);
    }

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }
}
