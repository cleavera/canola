export interface IRequest {
    get(url: string): Promise<string>;
    post(url: string): Promise<string>;
}
