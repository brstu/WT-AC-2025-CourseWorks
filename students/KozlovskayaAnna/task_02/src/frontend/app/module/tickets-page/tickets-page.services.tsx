// import { useState } from 'react'
import { ITicket } from '@/app/shared/interface'

interface IProps {
    tickets: ITicket[]
}

export const useTicketsPageServices = ({ tickets: ticketsLocal }: IProps) => {
    // const [ticketsLocal, setTicketsLocal] = useState<ITicket[]>(tickets)

    return { ticketsLocal }
}
