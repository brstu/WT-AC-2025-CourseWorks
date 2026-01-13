import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'

export default function CartPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get('/cart')
      return response.data
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      await api.put(`/cart/items/${id}`, { quantity })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/cart/items/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  if (isLoading) return <div>Loading...</div>

  const total = data?.reduce((sum: number, item: any) => {
    return sum + item.product.price * item.quantity
  }, 0) || 0

  return (
    <div>
      <h1>Cart</h1>
      {data?.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          {data?.map((item: any) => (
            <div key={item.id} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
              <h3>{item.product.name}</h3>
              <p>Price: ${item.product.price}</p>
              <p>
                Quantity:
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateMutation.mutate({ id: item.id, quantity: parseInt(e.target.value) })
                  }
                  min="1"
                />
              </p>
              <p>Subtotal: ${item.product.price * item.quantity}</p>
              <button onClick={() => deleteMutation.mutate(item.id)}>Remove</button>
            </div>
          ))}
          <div>
            <h2>Total: ${total}</h2>
          </div>
        </>
      )}
    </div>
  )
}
