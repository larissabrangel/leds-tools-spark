import path from "path";
import { checkIsDir } from "./checkers";
import { services_checkers } from "./src_content_checkers/services_checkers";
import { stores_checkers } from "./src_content_checkers/stores/stores_checkers";

export function execute(root_folder: string) {
    const servicesPath = path.join(root_folder, 'services');
    checkIsDir(servicesPath);
    services_checkers(servicesPath);

    const storesPath = path.join(root_folder, 'stores');
    checkIsDir(storesPath);
    stores_checkers(storesPath);

    const themePath = path.join(root_folder, 'theme');
    checkIsDir(themePath);
    theme_checkers(themePath);

    const utilsPath = path.join(root_folder, 'utils');
    checkIsDir(utilsPath);
    stores_checkers(utilsPath);

    const viewsPath = path.join(root_folder, 'views');
    checkIsDir(viewsPath);
    stores_checkers(viewsPath);
}