export function TableCellComponentFactory(contents: Array<HTMLElement>, span: number | null = null): HTMLTableCellElement {
    const cell: HTMLTableCellElement = document.createElement('td');

    contents.forEach((content: HTMLElement) => {
        cell.appendChild(content);
    });

    if (span !== null) {
        cell.colSpan = span;
    }

    return cell;
}
