import { CompanyName } from '@canola/domain';

import { TextComponentFactory } from './text.component';

export function CompanyNameComponentFactory(companyName: CompanyName): HTMLSpanElement {
    const container: HTMLSpanElement = document.createElement('span');
    const companyLink: HTMLAnchorElement = document.createElement('a');

    companyLink.href = `/id_view.php?ID=${companyName.id}`;
    companyLink.textContent = companyName.name;

    const idElement: HTMLSpanElement = TextComponentFactory(` [${companyName.id}]`);

    container.appendChild(companyLink);
    container.appendChild(idElement);

    return container;
}
