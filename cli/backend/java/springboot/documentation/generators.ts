import fs from "fs";
import path from 'path'
import { expandToStringWithNL } from "langium/generate";
import { Configuration, Model } from "../../../../../language/generated/ast.js";


export function generate(model: Model, target_folder: string) : void {
    fs.mkdirSync(target_folder, {recursive:true})
  
    if (model.configuration){
        fs.writeFileSync(path.join(target_folder, 'README.md'),createProjectReadme(model.configuration))
        fs.writeFileSync(path.join(target_folder, '.gitlab-ci.yml'),createGitlab())
    } 
   
  
}

function createGitlab():string{
    return expandToStringWithNL`
    variables:
    CONTAINER_TEST_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG
    CONTAINER_RELEASE_IMAGE: $CI_REGISTRY_IMAGE:latest

    stages:
    - build-entity
    - build-webservice
    - release-webservice

    maven-build:
    stage: build-entity
    image: maven:latest
    script: 
        - cd entity
        - mvn deploy -s settings.xml -DskipTests

    build-webservice:
    stage: build-webservice
    image: docker:20.10.16
    services:
        - docker:20.10.16-dind
    before_script:
        - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    script:
        - cd webservice
        - docker build --pull -t $CONTAINER_TEST_IMAGE .
        - docker push $CONTAINER_TEST_IMAGE

    release-master-webservice:
    stage: release-webservice
    image: docker:20.10.16
    services:
        - docker:20.10.16-dind
    before_script:
        - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    script:
        - cd webservice
        - docker pull $CONTAINER_TEST_IMAGE
        - docker tag $CONTAINER_TEST_IMAGE $CONTAINER_RELEASE_IMAGE
        - docker push $CONTAINER_RELEASE_IMAGE
    only:
        - main

    release-dev-webservice:
    stage: release-webservice
    script:
        - cd webservice
        - docker pull $CONTAINER_TEST_IMAGE
        - docker tag $CONTAINER_TEST_IMAGE $CONTAINER_TEST_IMAGE
        - docker push $CONTAINER_TEST_IMAGE
    only:
        - dev

    `
}

function stackREADME (): string {
    return expandToStringWithNL`
        1. Spring Boot 3.0
        2. Spring Data Rest
        3. Spring GraphQL
        
    `

}

function createProjectReadme(configuration: Configuration): string{
    return expandToStringWithNL`
    # ${configuration.name}
    ## 🚀 Goal
    ${configuration.description}

    ## 📕 Domain Documentation
    
    Domain documentation can be found [here](./docs/README.md)

    ## ⚙️ Requirements

    1. Postgresql
    2. Java 17
    3. Maven

    ## ⚙️ Stack 
    ${stackREADME()}

    ## 🔧 Install

    1) Create a database with name ${configuration.name} with **CREATE DATABASE ${configuration.name}**.
    2) Run the command to start the webservice and create table of database:

    \`\`\`bash
    mvn Spring-boot:run 
    \`\`\`

    ## Debezium

    Go to folder named *register* and performs following command to register in debezium:

    \`\`\`bash
    curl -i -X POST -H "Accept:application/json" -H  "Content-Type:application/json" http://localhost:8083/connectors/ -d @register-sro.json
    \`\`\`

    To delete, uses:

    \`\`\`bash
    curl -i -X DELETE localhost:8083/connectors/sro-connector/
    \`\`\`
        
    
    ## 🔧 Usage

    * Access [http://localhost:8081](http://localhost:8081) to see Swagger 
    * Access [http://localhost:8081/grapiql](http://localhost:8081/grapiql) to see Graphql.

    `
}