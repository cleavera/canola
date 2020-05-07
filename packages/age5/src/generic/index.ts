import { helloWorld } from './features/hello-world';

export async function genericAdditions(): Promise<void> {
    await helloWorld();
}
