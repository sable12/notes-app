import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
})

export const notesApi = {
  list: () => client.get('/notes').then(r => r.data),
  get: (id) => client.get(`/notes/${id}`).then(r => r.data),
  create: (note) => client.post('/notes', note).then(r => r.data),
  update: (id, note) => client.put(`/notes/${id}`, note).then(r => r.data),
  remove: (id) => client.delete(`/notes/${id}`)
}

export default client
