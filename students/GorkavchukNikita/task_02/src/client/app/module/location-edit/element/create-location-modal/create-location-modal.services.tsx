import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { COMMON_ERRORS, envConfig } from '@/app/constants'
import { EResponseStatus, ICity, ICountry } from '@/app/shared/interface'

type FormValues = {
    type: number | undefined
    label: string
    locationCode: string
    cityId: string
    postalCode: string
    street: string
}

type CreateLocationBody = {
    type: number | undefined
    label: string
    locationCode: string
    cityId: string
    postalCode: string
    street: string
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

interface ICitiesResponse {
    status: 'ok'
    code: number
    page: number
    limit: number
    total: number
    pages: number
    data: ICity[]
}

export interface ICityOption {
    id: string
    label: string
}

interface IProps {
    onSuccess?: () => void
    open: boolean
}

export const useCreateLocationServices = ({ onSuccess, open }: IProps) => {
    const {
        register,
        handleSubmit: validateBeforeSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormValues>()

    const [apiError, setApiError] = useState<string>('')

    const [cityOptions, setCityOptions] = useState<ICityOption[]>([])
    const [citiesLoading, setCitiesLoading] = useState<boolean>(false)
    const [citiesError, setCitiesError] = useState<string>('')

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

    const fetchAllCities = useCallback(async () => {
        const all: ICity[] = []
        let currentPage = 1
        let pages = 1

        while (currentPage <= pages) {
            const response = await fetch(
                `${envConfig.API_URL_ADMIN}/city?page=${currentPage}&limit=100`,
                {
                    method: 'GET',
                    credentials: 'include',
                }
            )

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }

            const json: ICitiesResponse = await response.json()
            pages = json.pages
            all.push(...json.data)
            currentPage += 1
        }

        return all
    }, [])

    const loadCityOptions = useCallback(async () => {
        try {
            setCitiesError('')
            setCitiesLoading(true)

            const [countries, cities] = await Promise.all([fetchAllCountries(), fetchAllCities()])

            const countryMap = new Map<string, ICountry>()
            countries.forEach((c) => countryMap.set(c._id, c))

            const options: ICityOption[] = cities
                .map((city) => {
                    const rawCountryId = city.countryId as any
                    const countryId =
                        rawCountryId && typeof rawCountryId === 'object' && typeof rawCountryId._id === 'string'
                            ? rawCountryId._id
                            : (rawCountryId as string)

                    const country = countryId ? countryMap.get(countryId) : undefined

                    const countryText = country
                        ? `${country.name} (${country.countryCode})`
                        : countryId
                        ? countryId
                        : 'Unknown country'

                    return {
                        id: city._id,
                        label: `${city.name} (${city.cityCode}) - ${countryText}`,
                    }
                })
                .sort((a, b) => a.label.localeCompare(b.label))

            setCityOptions(options)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED
            setCitiesError(message)
        } finally {
            setCitiesLoading(false)
        }
    }, [fetchAllCountries, fetchAllCities])

    useEffect(() => {
        if (!open) return
        if (cityOptions.length > 0) return
        loadCityOptions()
    }, [open, loadCityOptions, cityOptions.length])

    const createLocation = async (data: CreateLocationBody) => {
        try {
            setApiError('')

            const payload = {
                ...data,
                type: Number(data.type),
                label: data.label.trim(),
                locationCode: data.locationCode.trim().toUpperCase(),
                postalCode: data.postalCode.trim(),
                street: data.street.trim(),
            }

            const response = await fetch(`${envConfig.API_URL_ADMIN}/location/`, {
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

            reset({ type: undefined, label: '', locationCode: '', cityId: '', postalCode: '', street: '' })
            onSuccess?.()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

            setApiError(message)
            console.error(message)
        }
    }

    const handleSubmit = async (data: FormValues) => {
        createLocation(data)
    }

    return {
        validateBeforeSubmit,
        errors,
        apiError,
        isSubmitting,
        register,
        handleSubmit,
        cityOptions,
        citiesLoading,
        citiesError,
    }
}
