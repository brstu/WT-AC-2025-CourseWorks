export const PUBLIC_URLS = {
    imagesEvents: `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/events`,
    imagesSpeakers: `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/speakers`,
} as const
