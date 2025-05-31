import fs from 'fs';
import path from 'path';


export function deleteFolderRecursive(folderPath: string) {
    if (fs.existsSync(folderPath)) {
        // (this get all folder sons (dirs and files)) 
        const files = fs.readdirSync(folderPath);

        files.forEach(file => {
            const currentPath = path.join(folderPath, file);

            if (fs.lstatSync(currentPath).isDirectory()) {
                deleteFolderRecursive(currentPath); // call recursion if has subfolders
            } else {
                fs.unlinkSync(currentPath); // file deletion
            }
        });

        fs.rmdirSync(folderPath); // removes the dir
    } else {
        throw new Error(`Directory not found or inaccessible to deletion: ${folderPath}`);
    }
}
