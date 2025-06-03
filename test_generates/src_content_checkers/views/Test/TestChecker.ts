import path from "path";
import { checkIsDir } from "../../../checkers";
import { Entidade1Checker } from "./Entidade1/Entidade1Checker";
import { Entidade2Checker } from "./Entidade2/Entidade2Checker";


export class TestChecker{
    constructor(private localPath: string) { checkIsDir(this.localPath); }

    public testCheckers() {
        const checkEntidade1 = new Entidade1Checker(path.join(this.localPath, 'Entidade1'));
        checkEntidade1.entidade1Checkers();

        const checkEntidade2 = new Entidade2Checker(path.join(this.localPath, 'Entidade2'));
        checkEntidade2.entidade2Checkers();
    }
}