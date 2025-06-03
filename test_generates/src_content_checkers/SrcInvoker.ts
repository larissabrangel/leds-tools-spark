import { Command } from "./Command";


export class SrcInvoker {
    run(command: Command): void {
        command.execute();
    }
}