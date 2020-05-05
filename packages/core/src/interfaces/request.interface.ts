import { IDomElement } from './dom-element.interface';

export interface IRequest {
    get(url: string): Promise<IDomElement>;
    post(url: string): Promise<string>;
}
