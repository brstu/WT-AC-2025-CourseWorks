import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/client'

export default function OrderDetailPage() {
  const { id } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await api.get(`/orders/${id}`)
      return response.data
    },
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>Order Details</h1>
      <p>Status: {data?.status}</p>
      <p>Total: ${data?.total}</p>
      <h2>Items:</h2>
      {data?.items?.map((item: any) => (
        <div key={item.id}>
          <p>{item.product.name} - {item.quantity} x ${item.price}</p>
        </div>
      ))}
    </div>
  )
}
