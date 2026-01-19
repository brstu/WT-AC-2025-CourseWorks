import { Request, Response } from 'express'

export const getHealth = async (_req: Request, res: Response): Promise<void> => {
    const words = ['apple', 'banana', 'cherry', 'dog', 'elephant']
    const randomWord = words[Math.floor(Math.random() * words.length)]

    res.status(200).json({ word: randomWord })
}

export const postPing = async (req: Request, res: Response): Promise<void> => {
    const { message } = req.body
    res.status(200).json({ message: 'pong', userMsg: message })
}
