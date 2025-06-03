import path from "path";
import { checkFileContent, checkIsDir, checkIsFile } from "../../checkers";

export function stores_checkers(local_path: string) {
    checkIsFile(path.join(local_path, 'api.ts'));

    // kanban de stores
    const kanbanPath = path.join(local_path, 'kanban');
    checkIsDir(kanbanPath)

    // userprofile de stores
    const userprofilePath = path.join(local_path, 'userprofile');
    checkIsDir(userprofilePath)
}