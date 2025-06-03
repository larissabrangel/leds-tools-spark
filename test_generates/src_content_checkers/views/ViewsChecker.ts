import path from "path";
import { checkFileContent, checkIsDir, checkIsFile } from "../../checkers";
import { AuthChecker } from "./authentication/AuthChecker";
import { TestChecker } from "./Test/TestChecker";


export class ViewChecker{
    constructor(private localPath: string) { checkIsDir(this.localPath); }

    public viewsCheckers(): void {
        checkIsDir(path.join(this.localPath, 'dashboard')); // pasta vazia que é gerada
        checkIsFile(path.join(this.localPath, 'index.vue'));
        checkFileContent(path.join(this.localPath, 'index.vue'), "<template>\n</template>"); 

        const checkApps = new AuthChecker(path.join(this.localPath, 'authentication'));
        checkApps.authCheckers(); 

        const checkTest = new TestChecker(path.join(this.localPath, 'Test'));
        checkTest.testCheckers();
    }
}