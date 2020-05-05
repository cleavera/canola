import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';

import { CompanyName } from '../classes/company-name';

export class CompanyNameRepository {
    private static readonly PARSER_REGEX: RegExp = /([A-z0-9\s]+) \[([0-9]{1,4})]/;

    public async get(): Promise<CompanyName> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();
        const response: IDomElement = await request.get('/overview.php');
        const companyElement: IDomElement = response.querySelector('#game-info-company') ?? this._throwNoCompanyInformationFound();

        return this._parseCompanyName(companyElement.textContent ?? this._throwNoCompanyInformationFound());
    }

    private _parseCompanyName(str: string): CompanyName {
        const [, name, id]: RegExpExecArray = CompanyNameRepository.PARSER_REGEX.exec(str) ?? this._throwInvalidIdString(str);

        return new CompanyName(id, name);
    }

    private _throwInvalidIdString(str: string): never {
        throw new Error(`Invalid id string '${str}'`);
    }

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }

    private _throwNoCompanyInformationFound(): never {
        throw new Error('Could not find company information');
    }
}
