import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/client'

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get('/orders')
      return response.data
    },
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>Orders</h1>
      {data?.content?.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div>
          {data?.content?.map((order: any) => (
            <div key={order.id} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
              <h3>Order #{order.id.substring(0, 8)}</h3>
              <p>Status: {order.status}</p>
              <p>Total: ${order.total}</p>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <Link to={`/orders/${order.id}`}>View Details</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
