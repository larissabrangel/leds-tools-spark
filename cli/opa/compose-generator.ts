import { expandToString } from "langium/generate";
import fs from "fs";
import path from "path";

export function generateCompose(target_folder: string) : void {

    fs.writeFileSync(path.join(target_folder, `docker-compose.yml`), generateYml());

}

function generateYml() : string {
    return expandToString`
version: '3.8'

services:
  opa:
    image: openpolicyagent/opa:latest
    container_name: opa-server
    command: "run --server --log-level debug /policies/"
    ports:
      - "8181:8181"
    volumes:
      - ./policies:/policies
`
}