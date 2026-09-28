import { z } from 'zod'
import { emailField } from '../common/email.field.ts'

export const forgotPasswordSchema = z.object({ email: emailField })
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>
