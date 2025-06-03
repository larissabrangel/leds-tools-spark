import { Command } from "../Command";
import { SrcReceiver } from "../SrcReceiver";


export class ViewsCommand implements Command {
    constructor(private srcReceiver: SrcReceiver, private viewsDir: string) {}

    execute(): void {
        this.srcReceiver.checkStores(this.viewsDir);
    }
}