import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { COMMON_ERRORS, envConfig } from '@/app/constants'
import { EResponseStatus, ICity, ICountry, ILocation } from '@/app/shared/interface'

type FormValues = {
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
    selectedLocation: ILocation | null
    onSuccess?: () => void
    open: boolean
}

export const useEditLocationServices = ({ onSuccess, selectedLocation, open }: IProps) => {
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
    const [cityCodeToId, setCityCodeToId] = useState<Record<string, string>>({})

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
            const response = await fetch(`${envConfig.API_URL_ADMIN}/city?page=${currentPage}&limit=100`, {
                method: 'GET',
                credentials: 'include',
            })

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

            const codeMap: Record<string, string> = {}

            const options: ICityOption[] = cities
                .map((city) => {
                    codeMap[String(city.cityCode)] = city._id

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

            setCityCodeToId(codeMap)
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

    const currentCityId = useMemo(() => {
        if (!selectedLocation) return ''

        const rawCity: any = selectedLocation.cityId as any

        // If backend returned ObjectId string
        if (typeof rawCity === 'string') {
            return rawCity
        }

        if (rawCity && typeof rawCity === 'object') {
            if (typeof rawCity._id === 'string') {
                return rawCity._id
            }

            const code = typeof rawCity.cityCode === 'string' ? rawCity.cityCode : ''
            return code ? cityCodeToId[code] ?? '' : ''
        }

        return ''
    }, [selectedLocation, cityCodeToId])

    useEffect(() => {
        if (!selectedLocation) {
            return
        }

        reset({
            type: typeof selectedLocation.type === 'number' ? selectedLocation.type : undefined,
            label: selectedLocation.label ?? '',
            locationCode: selectedLocation.locationCode ?? '',
            cityId: currentCityId ?? '',
            postalCode: selectedLocation.postalCode ?? '',
            street: selectedLocation.street ?? '',
        })
    }, [selectedLocation, reset, currentCityId])

    const patchLocation = async (data: FormValues) => {
        if (!selectedLocation) {
            return
        }

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

            const response = await fetch(`${envConfig.API_URL_ADMIN}/location/${selectedLocation._id}`, {
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
        patchLocation(data)
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
