import { CompanyName } from '@canola/domain';

import { TextComponentFactory } from './text.component';

export function IdListComponentFactory(idList: Array<CompanyName>): HTMLSpanElement {
    return TextComponentFactory(idList.reduce<string>((accumulator: string | null, defender: CompanyName): string => {
        if (accumulator === null) {
            return defender.id;
        }

        return `${accumulator}, ${defender.id}`;
    }, null as any)); // eslint-disable-line @typescript-eslint/no-explicit-any
}
