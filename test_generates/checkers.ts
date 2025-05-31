import fs from 'fs';

export function checkIsDir(pathTest: string) { 
    try {
        const stats = fs.statSync(pathTest);
        if (!stats.isDirectory()) {
            throw new Error(`Path exists but is not a directory: ${pathTest}`);
        }
    } catch (err) {
        throw new Error(`Directory not found or inaccessible: ${pathTest}`);
    }
}

export function checkFileContent(fileTest: string, testString: string, isJson: boolean = false) {
    try {
        const fileGeneratedString = fs.readFileSync(fileTest, 'utf-8');
        if (isJson) {
            const normalizedReferenceJsonString = JSON.stringify(JSON.parse(testString));
            if (JSON.stringify(JSON.parse(fileGeneratedString)) != normalizedReferenceJsonString) { 
                throw new Error(`The content of ${fileTest} is wrong`);
            }
        }
        else {
            if (fileGeneratedString != testString) {
                throw new Error(`The content of ${fileTest} is wrong`);
            }
        }

    }
    catch (err) {
        throw new Error(`File not found or inacessible: ${fileTest}`);
    }
}

export function checkIsFile(fileTest: string) { 
    try {
        const stats = fs.statSync(fileTest);
        if (!stats.isFile()) {
            throw new Error(`Path exists but is not a file: ${fileTest}`);
        }
    } catch (err) {
        throw new Error(`File not found or inaccessible: ${fileTest}`);
    }
}