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