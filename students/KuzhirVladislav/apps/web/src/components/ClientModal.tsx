import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { Client } from '../types/models'
import clientsApi from '../api/clients'
import { IconTrash, IconCheck } from './Icons'
import '../styles/modal.css'

interface ClientModalProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
  onSave?: (client: Client) => void
}

export default function ClientModal({ client, isOpen, onClose, onSave }: ClientModalProps) {
  const [formData, setFormData] = useState<Partial<Client>>(client || {})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData(client || {})
      setIsEditing(false)
      setError(null)
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }

    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [isOpen, client])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!formData.name) {
      setError('Заполните название компании')
      return
    }

    setLoading(true)
    try {
      const updatedClient = await clientsApi.update(String(client!.id), formData as Partial<Client>)
      setIsEditing(false)
      onSave?.(updatedClient)
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этого клиента?')) return

    setLoading(true)
    try {
      await clientsApi.remove(String(client!.id))
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Редактирование клиента' : 'Детали клиента'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-body">
          {isEditing ? (
            <form className="form">
              <div className="form-group">
                <label>Компания/ФИ *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Название компании или ФИ"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div className="form-group">
                <label>Телефон</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="form-group">
                <label>Адрес</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Адрес"
                />
              </div>

              <div className="form-group">
                <label>Примечания</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={4}
                  placeholder="Дополнительная информация о клиенте"
                />
              </div>
            </form>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <label>Компания/ФИ</label>
                <div className="info-value">{formData.name}</div>
              </div>

              <div className="info-item">
                <label>Email</label>
                <div className="info-value">{formData.email || 'Не указан'}</div>
              </div>

              <div className="info-item">
                <label>Телефон</label>
                <div className="info-value">{formData.phone || 'Не указан'}</div>
              </div>

              <div className="info-item">
                <label>Адрес</label>
                <div className="info-value">{formData.address || 'Не указан'}</div>
              </div>

              <div className="info-item full">
                <label>Примечания</label>
                <div className="info-value">{formData.notes || 'Не указаны'}</div>
              </div>

              {formData.createdAt && (
                <div className="info-item">
                  <label>Создан</label>
                  <div className="info-value">{new Date(formData.createdAt).toLocaleDateString('ru-RU')}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {isEditing ? (
            <>
              <button className="button button-secondary" onClick={() => setIsEditing(false)} disabled={loading}>
                Отмена
              </button>
              <button className="button button-primary" onClick={handleSave} disabled={loading}>
                <IconCheck /> Сохранить
              </button>
            </>
          ) : (
            <>
              <button className="button button-danger" onClick={handleDelete} disabled={loading}>
                <IconTrash /> Удалить
              </button>
              <button className="button button-primary" onClick={() => setIsEditing(true)}>
                ✎ Редактировать
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

