export const EventCardSkeleton = () => {
    return (
        <div className="inline-block">
            <div className="flex border border-gray-200 rounded-[14px] overflow-hidden">
                <div className="bg-gray-300 w-[100px] h-[180px] flex-none animate-pulse"></div>
                <div className="flex flex-col p-2 flex-1">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold min-h-14 line-clamp-2 break-normal animate-pulse">
                            <div className="w-[120px] h-[28px] bg-gray-300 rounded-md" />
                        </h3>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1 py-px">
                            <div className="w-[80px] h-[10px] bg-gray-300 rounded-md animate-pulse" />
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 py-px">
                            <div className="w-[80px] h-[10px] bg-gray-300 rounded-md animate-pulse" />
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 py-px">
                            <div className="w-[80px] h-[10px] bg-gray-300 rounded-md animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
