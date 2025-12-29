import Image from 'next/image'
import { IEventSpeaker } from '@/app/shared/interface'
import { PUBLIC_URLS } from '@/app/constants/public-aws-urls'

interface IProps {
    speaker: IEventSpeaker
}

export const SpeakerItem = ({ speaker }: IProps) => {
    return (
        <div className="border border-gray-100 rounded-lg p-3 flex flex-col gap-2">
            <div className="grid grid-cols-[48px_1fr] items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    <Image
                        src={`${PUBLIC_URLS.imagesSpeakers}/${speaker.photo.name}`}
                        // src={`/speaker-test.jpg`}
                        alt={speaker.photo.alt}
                        width={48}
                        height={48}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                </div>
                <div className="flex flex-col">
                    <span className="font-semibold text-sm">{speaker.name}</span>
                    <span className="text-xs text-gray-500">{speaker.contacts.email}</span>
                </div>
            </div>

            <p className="text-sm text-gray-700 line-clamp-3">{speaker.bio}</p>
        </div>
    )
}
