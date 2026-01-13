import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../api/client'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  imageUrl: string
}

export default function ProductsPage() {
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['products', category, search, page],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (search) params.append('search', search)
      params.append('page', page.toString())
      params.append('size', '20')
      const response = await api.get(`/products?${params}`)
      return response.data
    },
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>Products</h1>
      <div>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Books">Books</option>
          <option value="Clothing">Clothing</option>
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {data?.content?.map((product: Product) => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '1rem' }}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>${product.price}</p>
            <p>Stock: {product.stock}</p>
            <Link to={`/products/${product.id}`}>View Details</Link>
          </div>
        ))}
      </div>
      <div>
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>Page {page + 1}</span>
        <button disabled={data?.last} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}
