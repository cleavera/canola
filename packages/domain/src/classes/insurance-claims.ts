import { Funds } from './funds';
import { Insurance } from './insurance';

export class InsuranceClaims {
    public readonly claims: ReadonlyArray<Insurance>;

    constructor(claims: Array<Insurance>) {
        this.claims = claims;
    }

    public value(): Funds {
        return Funds.Sum(...this.claims.map((claim: Insurance) => {
            return claim.funds;
        }));
    }
}
