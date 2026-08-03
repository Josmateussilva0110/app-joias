import { supabaseAuth, supabaseAdmin, createSupabaseClientForUser } from "../database/supabase/supabase"
import { USER_PROFILE_SELECT } from "../constants/user.constants"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { UserErrorCode } from "../types/code/userCode"
import { AuthTokens } from "../types/auth/auth.types"
import { UserProfile } from "../types/users/profile"
import { RegisterDTO } from "../types/users/register"
import { ChangePasswordDTO } from "../schemas/changePasswordSchema"
import { PasswordResetRequestDTO } from "../schemas/passwordResetRequestSchema"
import { getUserIdFromAccessToken } from "../utils/accessToken"
import { isRefreshTokenReuseOrRevoked } from "../utils/authErrors"
import { buildAuthTokens } from "../utils/authSession"
import { mapUserProfileRow } from "../utils/userProfile"
import { revokeAccessToken, revokeUserSessions } from "../utils/tokenRevocation"

class UserService {
    async register(data: RegisterDTO): Promise<ServiceResult<{ id: string }, UserErrorCode>> {
        try {
            const { username, email, password } = data

            const { data: authData, error } = await supabaseAuth.auth.signUp({
                email,
                password,
                options: {
                    data: { username },
                },
            })

            if (error) {
                console.error("[UserService.register] Supabase Auth error:", error)

                if (error.code === "user_already_exists" || error.status === 422) {
                    return {
                        status: false,
                        error: {
                            code: UserErrorCode.EMAIL_ALREADY_EXISTS,
                            message: "Não foi possível criar a conta. Verifique os dados ou tente outro e-mail.",
                        },
                    }
                }

                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_CREATE_FAILED,
                        message: "Não foi possível criar o usuário. Tente novamente.",
                    },
                }
            }

            if (!authData.user?.id) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_CREATE_FAILED,
                        message: "Não foi possível criar o usuário. Tente novamente.",
                    },
                }
            }

            return {
                status: true,
                data: { id: authData.user.id },
            }
        } catch (error) {
            console.error("[UserService.register] error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_CREATE_FAILED,
                    message: "Não foi possível criar o usuário. Tente novamente.",
                },
            }
        }
    }

    async login(email: string, password: string): Promise<ServiceResult<AuthTokens, UserErrorCode>> {
        try {
            const { data, error } = await supabaseAuth.auth.signInWithPassword({
                email,
                password,
            })

            if (error || !data.session || !data.user) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.INVALID_CREDENTIALS,
                        message: "Email ou senha incorreto",
                    },
                }
            }

            return {
                status: true,
                data: buildAuthTokens(data.session, data.user),
            }
        } catch (error) {
            console.error("[UserService.login] error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.LOGIN_FAILED,
                    message: "Erro ao fazer login",
                },
            }
        }
    }

    async logout(accessToken: string): Promise<ServiceResult<null, UserErrorCode>> {
        try {
            const userId = getUserIdFromAccessToken(accessToken)

            if (!userId) {
                return {
                    status: false,
                    error: { code: UserErrorCode.LOGOUT_FAILED, message: "Erro ao fazer logout" },
                }
            }

            const { error } = await supabaseAdmin.auth.admin.signOut(userId, "global")

            if (error) {
                return {
                    status: false,
                    error: { code: UserErrorCode.LOGOUT_FAILED, message: "Erro ao fazer logout" },
                }
            }

            await revokeAccessToken(accessToken)
            await revokeUserSessions(userId)

            return { status: true, data: null }
        } catch (error) {
            console.error("[UserService.logout] error:", error)
            return {
                status: false,
                error: { code: UserErrorCode.LOGOUT_FAILED, message: "Erro ao fazer logout" },
            }
        }
    }

    async refresh(refreshToken: string): Promise<ServiceResult<AuthTokens, UserErrorCode>> {
        try {
            const { data, error } = await supabaseAuth.auth.refreshSession({
                refresh_token: refreshToken,
            })

            if (error || !data.session || !data.user) {
                const revoked = isRefreshTokenReuseOrRevoked(error)

                return {
                    status: false,
                    error: {
                        code: revoked ? UserErrorCode.SESSION_REVOKED : UserErrorCode.INVALID_CREDENTIALS,
                        message: revoked
                            ? "Sessão encerrada por segurança. Faça login novamente."
                            : "Sessão expirada. Faça login novamente.",
                    },
                }
            }

            return {
                status: true,
                data: buildAuthTokens(data.session, data.user),
            }
        } catch (error) {
            console.error("[UserService.refresh] error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.LOGIN_FAILED,
                    message: "Erro ao renovar sessão.",
                },
            }
        }
    }

    async getProfile(accessToken: string): Promise<ServiceResult<UserProfile, UserErrorCode>> {
        try {
            const userId = getUserIdFromAccessToken(accessToken)

            if (!userId) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_FETCH_FAILED,
                        message: "Sessão inválida.",
                    },
                }
            }

            const supabase = createSupabaseClientForUser(accessToken)

            const { data, error } = await supabase
                .from("users")
                .select(USER_PROFILE_SELECT)
                .eq("id", userId)
                .single()

            if (error || !data) {
                console.error("[UserService.getProfile]", error)
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_NOT_FOUND,
                        message: "Usuário não encontrado.",
                    },
                }
            }

            return {
                status: true,
                data: mapUserProfileRow(data),
            }
        } catch (error) {
            console.error("[UserService.getProfile] error:", error)

            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_FETCH_FAILED,
                    message: "Erro ao buscar perfil do usuário.",
                },
            }
        }
    }

    async updateProfile(
        accessToken: string,
        updates: { username: string }
    ): Promise<ServiceResult<UserProfile, UserErrorCode>> {
        try {
            const userId = getUserIdFromAccessToken(accessToken)

            if (!userId) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_UPDATE_FAILED,
                        message: "Sessão inválida.",
                    },
                }
            }

            const supabase = createSupabaseClientForUser(accessToken)

            const { data, error } = await supabase
                .from("users")
                .update({ username: updates.username })
                .eq("id", userId)
                .select(USER_PROFILE_SELECT)
                .single()

            if (error || !data) {
                console.error("[UserService.updateProfile]", error)
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_UPDATE_FAILED,
                        message: "Não foi possível atualizar o perfil.",
                    },
                }
            }

            return {
                status: true,
                data: mapUserProfileRow(data),
            }
        } catch (error) {
            console.error("[UserService.updateProfile] error:", error)

            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_UPDATE_FAILED,
                    message: "Erro ao atualizar perfil do usuário.",
                },
            }
        }
    }

    async updateEarningsPercent(
        accessToken: string,
        earningsPercent: number
    ): Promise<ServiceResult<UserProfile, UserErrorCode>> {
        try {
            const supabase = createSupabaseClientForUser(accessToken)

            const { data, error } = await supabase
                .from("users")
                .update({ earnings_percent: earningsPercent })
                .select(USER_PROFILE_SELECT)
                .single()

            if (error || !data) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_UPDATE_FAILED,
                        message: "Não foi possível salvar o percentual de ganho.",
                    },
                }
            }

            return {
                status: true,
                data: mapUserProfileRow(data),
            }
        } catch (error) {
            console.error("[UserService.updateEarningsPercent] error:", error)

            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_UPDATE_FAILED,
                    message: "Erro ao salvar o percentual de ganho.",
                },
            }
        }
    }

    async changePassword(
        accessToken: string,
        payload: ChangePasswordDTO
    ): Promise<ServiceResult<UserProfile, UserErrorCode>> {
        try {
            const userId = getUserIdFromAccessToken(accessToken)

            if (!userId) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_UPDATE_FAILED,
                        message: "Sessão inválida.",
                    },
                }
            }

            const supabase = createSupabaseClientForUser(accessToken)

            const { data: profileRow, error: profileError } = await supabase
                .from("users")
                .select(USER_PROFILE_SELECT)
                .eq("id", userId)
                .single()

            if (profileError || !profileRow) {
                console.error("[UserService.changePassword] profile fetch failed:", profileError)
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_NOT_FOUND,
                        message: "Usuário não encontrado.",
                    },
                }
            }

            const mustChangePassword = profileRow.must_change_password === true

            if (!mustChangePassword) {
                if (!payload.current_password) {
                    return {
                        status: false,
                        error: {
                            code: UserErrorCode.INVALID_PASSWORD,
                            message: "Informe a senha atual.",
                        },
                    }
                }

                const { error: reauthError } = await supabaseAuth.auth.signInWithPassword({
                    email: profileRow.email,
                    password: payload.current_password,
                })

                if (reauthError) {
                    return {
                        status: false,
                        error: {
                            code: UserErrorCode.INVALID_CREDENTIALS,
                            message: "Senha atual incorreta.",
                        },
                    }
                }
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: payload.new_password,
            })

            if (updateError) {
                console.error("[UserService.changePassword] update failed:", updateError)
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_UPDATE_FAILED,
                        message: "Não foi possível atualizar a senha.",
                    },
                }
            }

            if (mustChangePassword) {
                const { error: flagError } = await supabaseAdmin
                    .from("users")
                    .update({ must_change_password: false })
                    .eq("id", userId)

                if (flagError) {
                    console.error("[UserService.changePassword] flag update failed:", flagError)
                }
            }

            return this.getProfile(accessToken)
        } catch (error) {
            console.error("[UserService.changePassword] error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_UPDATE_FAILED,
                    message: "Não foi possível atualizar a senha.",
                },
            }
        }
    }

    async requestPasswordReset(
        payload: PasswordResetRequestDTO
    ): Promise<ServiceResult<{ accepted: true }, UserErrorCode>> {
        try {
            const identifier = payload.identifier.trim().toLowerCase()

            const { data: userRow } = await supabaseAdmin
                .from("users")
                .select("id")
                .eq("email", identifier)
                .maybeSingle()

            if (userRow?.id) {
                const { error: insertError } = await supabaseAdmin
                    .from("password_reset_requests")
                    .insert({
                        user_id: userRow.id,
                        identifier,
                        status: "pending",
                    })

                if (insertError) {
                    console.error("[UserService.requestPasswordReset] insert failed:", insertError)
                    return {
                        status: false,
                        error: {
                            code: UserErrorCode.PASSWORD_RESET_REQUEST_FAILED,
                            message: "Não foi possível registrar a solicitação.",
                        },
                    }
                }
            }

            return {
                status: true,
                data: { accepted: true },
            }
        } catch (error) {
            console.error("[UserService.requestPasswordReset] error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.PASSWORD_RESET_REQUEST_FAILED,
                    message: "Não foi possível registrar a solicitação.",
                },
            }
        }
    }
}

export default new UserService()
