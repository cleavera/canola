import { CropType, Stocks, StocksRepository } from '@canola/domain';

import { ButtonComponentFactory, throwIt } from '../../shared';

export async function sellMostFeature(): Promise<void> {
    const mainPage: HTMLElement = document.querySelector('#main-page-data') ?? throwIt('No supplies info found');
    const sellSurplusLink: HTMLButtonElement = mainPage.querySelector('a[onclick="SellAll();"]') ?? throwIt('No sell surplus button found');
    const suppliesFormElement: HTMLFormElement = mainPage.querySelector(':scope > form') ?? throwIt('No supplies info found');
    const sellTreeElement: HTMLInputElement = mainPage.querySelector('#SellPlant1') ?? throwIt('Could not get tree plants input');
    const sellBushElement: HTMLInputElement = mainPage.querySelector('#SellPlant2') ?? throwIt('Could not get bush plants input');
    const sellFlowerElement: HTMLInputElement = mainPage.querySelector('#SellPlant3') ?? throwIt('Could not get flower plants input');
    const sellGrassElement: HTMLInputElement = mainPage.querySelector('#SellPlant4') ?? throwIt('Could not get grass plants input');
    const stocks: Stocks = await new StocksRepository().getOwn();

    const sellMostButton: HTMLButtonElement = ButtonComponentFactory('Sell Most', 'Sells all but one million of each plant type', () => {
        const treeToSell: number = Math.max(stocks.plants[CropType.TREE] - 1e6, 0);
        const bushToSell: number = Math.max(stocks.plants[CropType.BUSH] - 1e6, 0);
        const flowerToSell: number = Math.max(stocks.plants[CropType.FLOWER] - 1e6, 0);
        const grassToSell: number = Math.max(stocks.plants[CropType.GRASS] - 1e6, 0);

        sellTreeElement.value = treeToSell.toString(10);
        sellBushElement.value = bushToSell.toString(10);
        sellFlowerElement.value = flowerToSell.toString(10);
        sellGrassElement.value = grassToSell.toString(10);

        suppliesFormElement.submit();
    });

    const sellSurplusButton: HTMLButtonElement = ButtonComponentFactory('Sell Surplus', 'Sells all but what is needed to fill up your acres', () => {
        sellSurplusLink.click();
    });

    sellMostButton.style.margin = '2px';
    sellSurplusButton.style.margin = '2px';

    sellSurplusLink.style.display = 'none';
    (sellSurplusLink.parentElement ?? throwIt('No sell surplus button found')).appendChild(sellSurplusButton);
    (sellSurplusLink.parentElement ?? throwIt('No sell surplus button found')).appendChild(sellMostButton);
}
