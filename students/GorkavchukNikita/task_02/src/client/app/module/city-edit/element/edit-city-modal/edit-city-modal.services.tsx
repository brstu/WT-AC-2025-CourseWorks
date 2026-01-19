import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { COMMON_ERRORS, envConfig } from '@/app/constants'
import { EResponseStatus, ICity, ICountry } from '@/app/shared/interface'

type FormValues = {
    name: string
    cityCode: string
    countryId: string
}

type PatchCityBody = {
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
    selectedCity: ICity | null
    onSuccess?: () => void
    open: boolean
}

export const useEditCityServices = ({ onSuccess, selectedCity, open }: IProps) => {
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

    const patchCity = async (data: PatchCityBody) => {
        if (!selectedCity) {
            return
        }

        try {
            setApiError('')

            const payload = {
                ...data,
                name: data.name.trim(),
                cityCode: data.cityCode.trim().toUpperCase(),
            }

            const response = await fetch(`${envConfig.API_URL_ADMIN}/city/${selectedCity._id}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'PATCH',
                credentials: 'include',
                body: JSON.stringify(payload),
            })

            const json = await response.json()

            if (json.status === EResponseStatus.error) {
                throw new Error(json.message)
            }

            onSuccess?.()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

            setApiError(message)
            console.error(message)
        }
    }

    const handleSubmit = async (data: FormValues) => {
        patchCity(data)
    }

    useEffect(() => {
        if (!selectedCity) {
            return
        }

        const raw = selectedCity.countryId
        const currentCountryId =
            raw && typeof raw === 'object' && typeof raw._id === 'string'
                ? raw._id
                : (raw as string)

        reset({
            name: selectedCity.name ?? '',
            cityCode: selectedCity.cityCode ?? '',
            countryId: currentCountryId ?? '',
        })
    }, [selectedCity, reset])

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
