import { CompanyName } from '@canola/domain';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';
import { TextComponentFactory } from './text.component';

export function IdListComponentFactory(idList: Array<CompanyName>): HTMLSpanElement {
    return TextComponentFactory(idList.reduce<string>((accumulator: Maybe<string>, defender: CompanyName): string => {
        if (isNull(accumulator)) {
            return defender.id;
        }

        return `${accumulator}, ${defender.id}`;
    }, null as any)); // eslint-disable-line @typescript-eslint/no-explicit-any
}
