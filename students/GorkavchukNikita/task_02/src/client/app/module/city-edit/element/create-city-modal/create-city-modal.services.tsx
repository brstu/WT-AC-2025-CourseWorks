import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { COMMON_ERRORS, envConfig } from '@/app/constants'
import { EResponseStatus, ICountry } from '@/app/shared/interface'

type FormValues = {
    name: string
    cityCode: string
    countryId: string
}

type CreateCityBody = {
    name: string
    cityCode: string
    countryId: string
}

interface ICountriesResponse {
    status: 'ok'
    code: number
    page: number
    limit: number
    total: number
    pages: number
    data: ICountry[]
}

interface IProps {
    onSuccess?: () => void
    open: boolean
}

export const useCreateCityServices = ({ onSuccess, open }: IProps) => {
    const {
        register,
        handleSubmit: validateBeforeSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormValues>()

    const [apiError, setApiError] = useState<string>('')
    const [countries, setCountries] = useState<ICountry[]>([])
    const [countriesLoading, setCountriesLoading] = useState<boolean>(false)
    const [countriesError, setCountriesError] = useState<string>('')

    const fetchAllCountries = useCallback(async () => {
        const all: ICountry[] = []
        let currentPage = 1
        let pages = 1

        while (currentPage <= pages) {
            const response = await fetch(
                `${envConfig.API_URL_ADMIN}/country?page=${currentPage}&limit=100`,
                {
                    method: 'GET',
                    credentials: 'include',
                }
            )

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }

            const json: ICountriesResponse = await response.json()
            pages = json.pages
            all.push(...json.data)
            currentPage += 1
        }

        return all
    }, [])

    const loadCountries = useCallback(async () => {
        try {
            setCountriesError('')
            setCountriesLoading(true)

            const list = await fetchAllCountries()
            list.sort((a, b) => a.name.localeCompare(b.name))
            setCountries(list)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED
            setCountriesError(message)
        } finally {
            setCountriesLoading(false)
        }
    }, [fetchAllCountries])

    useEffect(() => {
        if (!open) return
        if (countries.length > 0) return
        loadCountries()
    }, [open, loadCountries, countries.length])

    const createCity = async (data: CreateCityBody) => {
        try {
            setApiError('')

            const payload = {
                ...data,
                name: data.name.trim(),
                cityCode: data.cityCode.trim().toUpperCase(),
            }

            const response = await fetch(`${envConfig.API_URL_ADMIN}/city/`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify(payload),
            })

            const json = await response.json()

            if (json.status === EResponseStatus.error) {
                throw new Error(json.message)
            }

            reset({ name: '', cityCode: '', countryId: '' })
            onSuccess?.()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

            setApiError(message)
            console.error(message)
        }
    }

    const handleSubmit = async (data: FormValues) => {
        createCity(data)
    }

    return {
        validateBeforeSubmit,
        errors,
        apiError,
        isSubmitting,
        register,
        handleSubmit,
        countries,
        countriesLoading,
        countriesError,
    }
}
