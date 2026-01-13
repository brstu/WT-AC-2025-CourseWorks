import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/client'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get(`/products/${id}`)
      return response.data
    },
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>{data?.name}</h1>
      <p>{data?.description}</p>
      <p>Price: ${data?.price}</p>
      <p>Stock: {data?.stock}</p>
      <p>Category: {data?.category}</p>
    </div>
  )
}
