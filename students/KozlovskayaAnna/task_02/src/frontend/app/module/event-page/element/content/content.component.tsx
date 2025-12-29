import { useEventStoreContext } from '@/app/shared/providers'

export const ContentComponent = () => {
    const content = useEventStoreContext((state) => state.event?.content.html)

    return <div dangerouslySetInnerHTML={{ __html: content || '' }} className="event-content" />
}
