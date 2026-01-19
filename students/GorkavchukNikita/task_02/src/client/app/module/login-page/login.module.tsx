import { WrapperComponent } from '@/app/shared/component/wrapper'
import { LoginFormComponent } from '@/app/shared/component/login-form'

export const LoginModule = () => {
    return (
        <WrapperComponent className="flex items-center justify-center py-5">
            <LoginFormComponent />
        </WrapperComponent>
    )
}
