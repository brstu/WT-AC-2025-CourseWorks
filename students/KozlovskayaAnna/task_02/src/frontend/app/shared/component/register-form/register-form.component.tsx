'use client'

import Link from 'next/link'
import clsx from 'clsx'
import { Field, Input, Label, Description } from '@headlessui/react'
import { Button } from '@/app/shared/component/button'
import { ErrorComponent } from '@/app/shared/component/error'

import { useRegisterFormServices } from './register-form.services'
import { registerFormFields } from './register-form.constants'
import { Eye, EyeOff } from 'lucide-react'

export const RegisterFormComponent = () => {
    const thisService = useRegisterFormServices()

    return (
        <form
            onSubmit={thisService.validateBeforeSubmit(thisService.handleSubmit)}
            className="max-w-96 w-full py-5 px-3 rounded-xl flex flex-col gap-1 border-2 border-gray-100"
        >
            <Field className={clsx('form-field', thisService.errors.email && 'error')}>
                <Label className="form-field-label">Email</Label>
                <Input
                    className="form-field-input"
                    {...thisService.register(
                        registerFormFields.email.fieldName,
                        registerFormFields.email.validationOptions
                    )}
                />
                <Description className="form-field-error">
                    {thisService.errors.email && thisService.errors.email.message}
                </Description>
            </Field>

            <Field className={clsx('form-field', thisService.errors.name && 'error')}>
                <Label className="form-field-label">Name</Label>
                <Input
                    className="form-field-input"
                    {...thisService.register(
                        registerFormFields.name.fieldName,
                        registerFormFields.name.validationOptions
                    )}
                />
                <Description className="form-field-error">
                    {thisService.errors.name && thisService.errors.name.message}
                </Description>
            </Field>

            <Field className={clsx('form-field', thisService.errors.password && 'error')}>
                <Label className="form-field-label">Password</Label>
                <div className="flex mb-1">
                    <Input
                        type={thisService.showPassword ? 'text' : 'password'}
                        className="form-field-input form-field-input-no-mb"
                        {...thisService.register(
                            registerFormFields.password.fieldName,
                            registerFormFields.password.validationOptions
                        )}
                    />

                    <Button
                        type="button"
                        variant="ghost"
                        color="black"
                        className="ml-1"
                        startIcon={thisService.showPassword ? Eye : EyeOff}
                        onClick={() => thisService.handleTogglePasswordVisibility()}
                    />
                </div>
                <Description className="form-field-error">
                    {thisService.errors.password && thisService.errors.password.message}
                </Description>
            </Field>

            {thisService.apiError && <ErrorComponent>{thisService.apiError}</ErrorComponent>}

            <div className="pt-3 mt-3 border-t border-t-gray-200">
                <Button className="w-full" isSubmiting={thisService.isSubmitting}>
                    Register
                </Button>
            </div>

            <div className="text-center pt-3 text-gray-600">
                Already have an account?{' '}
                <Link href={'/login'} className="text-indigo-400 underline">
                    Log in!
                </Link>
            </div>
        </form>
    )
}
