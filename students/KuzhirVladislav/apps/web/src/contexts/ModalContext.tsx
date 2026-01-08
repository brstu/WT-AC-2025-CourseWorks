import React, { createContext, useContext, useState } from 'react'

type ModalState = {
  name: string | null
  props?: any
}

type ModalContextType = {
  open: (name: string, props?: any) => void
  close: () => void
  state: ModalState
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider = ({ children }:{children:React.ReactNode}) => {
  const [state,setState] = useState<ModalState>({ name: null })
  const open = (name:string, props?:any) => setState({ name, props })
  const close = () => setState({ name: null })
  return (
    <ModalContext.Provider value={{ open, close, state }}>
      {children}
      {state.name === 'login' && <div id="modal-root"><div>{/* modal rendered by route too */}</div></div>}
    </ModalContext.Provider>
  )
}

export const useModal = ()=>{ const ctx = useContext(ModalContext); if(!ctx) throw new Error('useModal must be used within ModalProvider'); return ctx }

