// Exportar todos os serviços
export { supabase } from './client'
export { authService } from './auth'
export { userService } from './user'
export { configService } from './config'

// Exportar tipos
export type { AuthUser, AuthSession, SignUpCredentials, SignInCredentials } from './auth'
export type { UserProfile, UserPermissions } from './user'
export type { ClinicConfig, ConfigCategory } from './config'

