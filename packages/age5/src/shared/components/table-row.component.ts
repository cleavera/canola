export function TableRowComponentFactory(...cells: Array<HTMLTableCellElement>): HTMLTableRowElement {
    const row: HTMLTableRowElement = document.createElement('tr');

    cells.forEach((cell: HTMLTableCellElement) => {
        row.appendChild(cell);
    });

    return row;
}
