import { WrapperComponent } from '@/app/shared/component/wrapper'
import { RegisterFormComponent } from '@/app/shared/component/register-form'

export const RegisterModule = () => {
    return (
        <WrapperComponent className="flex items-center justify-center py-5">
            <RegisterFormComponent />
        </WrapperComponent>
    )
}
