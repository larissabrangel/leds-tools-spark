import fs from "fs";
import path from "path";
import { expandToStringWithNL } from "langium/generate";
import { Configuration, Model } from "../../../../../language/generated/ast.js";


export function generate(model: Model, target_folder: string) : void {
    fs.mkdirSync(target_folder, {recursive: true})

    if(model.configuration){
        fs.writeFileSync(path.join(target_folder, 'README.md'),createProjectReadme(model.configuration))
        fs.writeFileSync(path.join(target_folder, '.gitlab-ci.yml'),createGitLab(model))
    }
}

function createGitLab(model : Model):string{
    return expandToStringWithNL`
    docker-build:
    image: docker:cli
    stage: build
    services:
      - docker:dind
    variables:
      DOCKER_IMAGE_NAME: "$CI_REGISTRY_IMAGE:latest"
      CI_DOCKERFILE_IMAGE: Dockerfile
    before_script:
      - cd backend/
      - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" "$CI_REGISTRY"
    script:
      - docker build -t "$DOCKER_IMAGE_NAME" -f "$CI_DOCKERFILE_IMAGE" .
      - docker push "$DOCKER_IMAGE_NAME"
    rules:
      - if: '$CI_COMMIT_BRANCH == "main" || $CI_COMMIT_BRANCH == "dev"'
  `
}

function stackREADME (): string {
    return expandToStringWithNL`
    1. Minimal API
    2. Swagger API
    `
}

function createProjectReadme(configuration : Configuration) : string{
    return expandToStringWithNL`
    # ${configuration.name}
    ## 🚀 Goal
    ${configuration.description}

    ## 📕 Domain Documentation
    
    Domain documentation can be found [here](./docs/README.md)

    ## ⚙️ Stack 
    ${stackREADME()}

    ## 🔧 Install

    ## 🔧 Usage

    `
}