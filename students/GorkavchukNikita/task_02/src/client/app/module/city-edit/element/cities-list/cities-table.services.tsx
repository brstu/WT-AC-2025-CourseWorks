'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { COMMON_ERRORS, envConfig } from '@/app/constants'
import { ICity, ICountry } from '@/app/shared/interface'

interface ICitiesResponse {
    status: 'ok'
    code: number
    page: number
    limit: number
    total: number
    pages: number
    data: ICity[]
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
    refreshToken: number
}

export const useCitiesTable = ({ refreshToken }: IProps) => {
    const [cities, setCities] = useState<ICity[]>([])
    const [countries, setCountries] = useState<ICountry[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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

    const fetchCities = useCallback(
        async (pageToLoad: number) => {
            try {
                setIsLoading(true)
                setError('')

                const [citiesResponse, countriesList] = await Promise.all([
                    fetch(`${envConfig.API_URL_ADMIN}/city?page=${pageToLoad}&limit=20`, {
                        method: 'GET',
                        credentials: 'include',
                    }),
                    fetchAllCountries().catch(() => [] as ICountry[]),
                ])

                if (!citiesResponse.ok) {
                    throw new Error(`Request failed with status ${citiesResponse.status}`)
                }

                const json: ICitiesResponse = await citiesResponse.json()

                setCities(json.data)
                setPage(json.page)
                setTotalPages(json.pages)
                setCountries(countriesList)
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED
                setError(message)
            } finally {
                setIsLoading(false)
            }
        },
        [fetchAllCountries]
    )

    useEffect(() => {
        fetchCities(1)
    }, [fetchCities, refreshToken])

    const goToPage = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages || nextPage === page) return
        fetchCities(nextPage)
    }

    const goNext = () => goToPage(page + 1)
    const goPrev = () => goToPage(page - 1)

    const countriesById = useMemo(() => {
        const map: Record<string, ICountry> = {}
        for (const c of countries) {
            map[c._id] = c
        }
        return map
    }, [countries])

    const getCityCountry = useCallback(
        (city: ICity): ICountry | null => {
            const raw = city.countryId as any

            if (raw && typeof raw === 'object' && typeof raw._id === 'string') {
                return raw as ICountry
            }

            if (typeof raw === 'string' && countriesById[raw]) {
                return countriesById[raw]
            }

            return null
        },
        [countriesById]
    )

    return {
        cities,
        page,
        totalPages,
        isLoading,
        error,
        goToPage,
        goNext,
        goPrev,
        getCityCountry,
        countriesLoaded: countries.length > 0,
    }
}
