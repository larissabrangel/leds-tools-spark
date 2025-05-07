import path from 'path';
import fs from 'fs';
import { Model } from '../../../../../language/generated/ast.js'
import { expandToStringWithNL } from 'langium/generate'

export function generate(model: Model, target_folder: string) {
    
    if (model.configuration) {
        fs.writeFileSync(path.join(target_folder, 'Properties.json'), createPropertiesJSON())
        fs.writeFileSync(path.join(target_folder, 'launchSettings.json'), createLaunchSettingsJSON())
    }
}

function createPropertiesJSON(): string {
    return expandToStringWithNL`
    {
        "profiles": {
          "http": {
            "commandName": "Project",
            "launchBrowser": true,
            "environmentVariables": {
              "ASPNETCORE_ENVIRONMENT": "Development"
            },
            "dotnetRunMessages": true,
            "applicationUrl": "http://localhost:5112"
          },
          "https": {
            "commandName": "Project",
            "launchBrowser": true,
            "environmentVariables": {
              "ASPNETCORE_ENVIRONMENT": "Development"
            },
            "dotnetRunMessages": true,
            "applicationUrl": "https://localhost:7000;http://localhost:5112"
          },
          "IIS Express": {
            "commandName": "IISExpress",
            "launchBrowser": true,
            "environmentVariables": {
              "ASPNETCORE_ENVIRONMENT": "Development"
            }
          },
          "Container (Dockerfile)": {
            "commandName": "Docker",
            "launchBrowser": true,
            "launchUrl": "{Scheme}://{ServiceHost}:{ServicePort}",
            "environmentVariables": {
              "ASPNETCORE_HTTPS_PORTS": "8081",
              "ASPNETCORE_HTTP_PORTS": "8080"
            },
            "publishAllPorts": true,
            "useSSL": true
          }
        },
        "$schema": "http://json.schemastore.org/launchsettings.json",
        "iisSettings": {
          "windowsAuthentication": false,
          "anonymousAuthentication": true,
          "iisExpress": {
            "applicationUrl": "http://localhost:58487",
            "sslPort": 44375
          }
        }
      }
    `
}

function createLaunchSettingsJSON(): string {
  return expandToStringWithNL`
  {
    "profiles": {
      "testeminimalapi": {
        "commandName": "Project",
        "launchBrowser": true,
        "environmentVariables": {
          "ASPNETCORE_ENVIRONMENT": "Development"
        },
        "applicationUrl": "https://localhost:62775;http://localhost:62776"
      },
      "Container (Dockerfile)": {
        "commandName": "Docker",
        "launchBrowser": true,
        "launchUrl": "{Scheme}://{ServiceHost}:{ServicePort}",
        "environmentVariables": {
          "ASPNETCORE_HTTPS_PORTS": "8081",
          "ASPNETCORE_HTTP_PORTS": "8080"
        },
        "publishAllPorts": true,
        "useSSL": true
      }
    }
  }
  `
}