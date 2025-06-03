import { Command } from "../Command";
import { SrcReceiver } from "../SrcReceiver";


export class StoresCommand implements Command {
    constructor(private srcReceiver: SrcReceiver, private storesDir: string) {}

    execute(): void {
        this.srcReceiver.checkStores(this.storesDir);
    }
}