import path from "path";
import { checkFileContent, checkIsFile } from "../checkers";

export function services_checkers(local_path: string) {
    checkIsFile(path.join(local_path, 'api.ts'));
    checkFileContent(path.join(local_path, 'api.ts'), `
import axios, { type AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: 'https://localhost:8081'
})

export default api;
`);
    // requires do services
    const servicesRequiresPath = path.join(local_path, 'requires');
    checkIsFile(path.join(servicesRequiresPath, 'Entidade1Requires.ts'));
    checkFileContent(path.join(servicesRequiresPath, 'Entidade1Requires.ts'), 
`
import serviceFactory from './factory.js'

export default function Entidade1Service() {
  return serviceFactory('api/Entidade1')
}
`);
    checkIsFile(path.join(servicesRequiresPath, 'Entidade2Requires.ts'));
    checkFileContent(path.join(servicesRequiresPath, 'Entidade2Requires.ts'),
`
import serviceFactory from './factory.js'

export default function Entidade2Service() {
  return serviceFactory('api/Entidade2')
}
`);
    checkIsFile(path.join(servicesRequiresPath, 'factory.ts'));
    checkFileContent(path.join(servicesRequiresPath, 'factory.ts'), 
`
import api from 'axios'
import useApi from '../../composition/UseApi'

export default function serviceFactory(apiUrl: string, listUrl?: string) {
  const { list, post, update, remove, getById } = useApi(apiUrl)

  let customList

  if (listUrl) {
    customList = async () => {
      const { data } = await api.get(listUrl)
      return data
    }
  }

  return {
    list: customList || list,
    post,
    update,
    remove,
    getById
  }
}
`
);
}