import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-2">
      <h3 className="text-2xl font-bold">Страница не найдена</h3>
      <Link className="btn-primary" to={'/'}>
        Вернуться домой
      </Link>
    </div>
  )
}
