import { NoInfoComponentFactory } from './no-info.component';

export function ActivityGraphComponentFactory(activity: Array<number>): HTMLElement {
    const graphContainer: HTMLElement = document.createElement('div');
    const chartContainer: HTMLElement = document.createElement('div');
    let max: number = 0;

    const yAxisLabels: HTMLDivElement = document.createElement('div');
    yAxisLabels.style.borderRight = '1px solid #111';
    yAxisLabels.style.boxSizing = 'border-box';
    yAxisLabels.style.display = 'flex';
    yAxisLabels.style.flexDirection = 'column-reverse';
    yAxisLabels.style.flex = '1 1 0px';
    yAxisLabels.style.marginLeft = '3px';
    chartContainer.appendChild(yAxisLabels);

    const xAxisLabels: HTMLDivElement = document.createElement('div');
    xAxisLabels.style.borderTop = '1px solid #111';
    xAxisLabels.style.display = 'flex';
    xAxisLabels.style.background = 'rgba(255, 255, 255, 0.8)';

    const padder: HTMLDivElement = document.createElement('div');
    padder.style.flex = '1 1 0px';
    xAxisLabels.appendChild(padder);
    let hasActivity: boolean = false;

    activity.forEach((count: number, index: number): void => {
        if (count > 0) {
            hasActivity = true;
        }

        const bar: HTMLDivElement = document.createElement('div');
        bar.style.setProperty('--count', count.toString());
        bar.style.height = 'calc(var(--count, 0) * var(--unitHeight, 10px))';
        bar.style.boxSizing = 'border-box';
        bar.style.flex = '1 1 0px';
        bar.style.background = '#66c';
        bar.style.margin = '0 2px';

        const label: HTMLDivElement = document.createElement('div');
        label.textContent = index.toString(10);
        label.style.textAlign = 'center';
        label.style.borderLeft = '1px solid #111';
        label.style.boxSizing = 'border-box';
        label.style.flex = '1 1 0px';

        if (count > max) {
            max = count;
        }

        chartContainer.appendChild(bar);
        xAxisLabels.appendChild(label);
    });

    if (!hasActivity) {
        return NoInfoComponentFactory('No activity');
    }

    graphContainer.style.setProperty('--unitHeight', `${(100 / max)}px`);
    chartContainer.style.display = 'flex';
    chartContainer.style.alignItems = 'flex-end';
    chartContainer.style.width = '100%';
    chartContainer.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.8) 98%, #aaaaaa 100%)';
    chartContainer.style.backgroundSize = 'var(--unitHeight) var(--unitHeight)';
    graphContainer.style.boxShadow = '0 0 3px 1px rgba(0,0,0,0.4)';
    graphContainer.style.maxWidth = '800px';
    graphContainer.style.margin = 'auto';

    for (let x = 1; x <= max; x++) {
        const label: HTMLDivElement = document.createElement('div');

        label.textContent = x.toString(10);
        label.style.height = 'var(--unitHeight)';
        label.style.textAlign = 'right';
        label.style.padding = '0 2px';

        yAxisLabels.appendChild(label);
    }

    graphContainer.appendChild(chartContainer);
    graphContainer.appendChild(xAxisLabels);

    return graphContainer;
}
