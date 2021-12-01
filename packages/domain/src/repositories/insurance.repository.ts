import { IDomElement, IRequest } from '@canola/core';

import { Funds } from '../classes/funds';
import { Insurance } from '../classes/insurance';
import { InsuranceClaims } from '../classes/insurance-claims';
import { Ticks } from '../classes/ticks';
import { getRequestService } from '../helpers/get-request-service.helper';

export class InsuranceRepository {
    public async getOwn(): Promise<InsuranceClaims | null> {
        const request: IRequest = getRequestService();
        const response: IDomElement = await request.get('/overview.php');
        const insuranceElement: IDomElement | null = response.querySelector('#Insurances');

        if (insuranceElement === null) {
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

    private _throwNoEta(): never {
        throw new Error('Could not get eta of insurance');
    }

    private _throwNoFunds(eta: number): never {
        throw new Error(`Could not get funds of insurance due at eta ${eta.toString(10)}`);
    }
}
