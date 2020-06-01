import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

export function TableCellComponentFactory(contents: Array<HTMLElement>, span: Maybe<number> = null): HTMLTableCellElement {
    const cell: HTMLTableCellElement = document.createElement('td');

    contents.forEach((content: HTMLElement) => {
        cell.appendChild(content);
    });

    if (!isNull(span)) {
        cell.colSpan = span;
    }

    return cell;
}
