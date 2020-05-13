import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { Funds } from '../classes/funds';
import { Insurance } from '../classes/insurance';
import { InsuranceClaims } from '../classes/insurance-claims';
import { Ticks } from '../classes/ticks';

export class InsuranceRepository {
    public async get(): Promise<Maybe<InsuranceClaims>> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();
        const response: IDomElement = await request.get('/overview.php');
        const insuranceElement: Maybe<IDomElement> = response.querySelector('#Insurances');

        if (isNull(insuranceElement)) {
            return null;
        }

        return new InsuranceClaims(this._parseInsuranceTable(insuranceElement));
    }

    private _parseInsuranceTable(injuriesTable: IDomElement): Array<Insurance> {
        const rows: ArrayLike<IDomElement> = injuriesTable.querySelectorAll('tr');
        const insurance: Array<Insurance> = [];

        // Skip the first row as its headers
        for (let x = 1; x < rows.length; x++) {
            const [etaCell, fundsCell]: Array<IDomElement> = Array.from(rows[x].querySelectorAll('td'));

            insurance.push(this._parseInsuranceRow(etaCell, fundsCell));
        }

        return insurance;
    }

    private _parseInsuranceRow(etaCell: IDomElement, fundsCell: IDomElement): Insurance {
        const eta: Ticks = Ticks.FromString(etaCell.textContent ?? this._throwNoEta());

        return new Insurance(Funds.FromString(fundsCell.textContent ?? this._throwNoFunds(eta.ticks)), eta);
    }

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }

    private _throwNoEta(): never {
        throw new Error('Could not get eta of insurance');
    }

    private _throwNoFunds(eta: number): never {
        throw new Error(`Could not get funds of insurance due at eta ${eta.toString(10)}`);
    }
}
