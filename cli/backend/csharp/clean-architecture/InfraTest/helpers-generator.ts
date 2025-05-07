import { expandToString } from "langium/generate";
import fs from "fs";
import path from "path";

export function generate(target_folder: string) : void {

    fs.writeFileSync(path.join(target_folder, "appsettings.json"), generateAppSettings())
    fs.writeFileSync(path.join(target_folder, "xunit.runner.json"), generateXunitRunner())

}

function generateAppSettings() : string {
    return expandToString`
{
  "ConnectionStrings": {
    "SqlServer": "Server=sqlserver,1433;Database=ConectaFapesDB;User ID=sa;Password=Senha@123;Trusted_Connection=False;TrustServerCertificate=True;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}`
}

function generateXunitRunner(): string {
    return expandToString`
{
  "shadowCopy": false
}`
}