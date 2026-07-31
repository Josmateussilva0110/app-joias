import { supabaseAuth, supabaseAdmin } from "../database/supabase/supabase"
import { USER_PROFILE_SELECT } from "../constants/user.constants"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { UserErrorCode } from "../types/code/userCode"
import { AuthTokens } from "../types/auth/auth.types"
import { UserProfile } from "../types/users/profile"
import { RegisterDTO } from "../types/users/register"
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

            revokeAccessToken(accessToken)
            revokeUserSessions(userId)

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

    async getProfile(userId: string): Promise<ServiceResult<UserProfile, UserErrorCode>> {
        try {
            const { data, error } = await supabaseAdmin
                .from("users")
                .select(USER_PROFILE_SELECT)
                .eq("id", userId)
                .single()

            if (error || !data) {
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
        userId: string,
        updates: { username: string }
    ): Promise<ServiceResult<UserProfile, UserErrorCode>> {
        try {
            const { data, error } = await supabaseAdmin
                .from("users")
                .update({ username: updates.username })
                .eq("id", userId)
                .select(USER_PROFILE_SELECT)
                .single()

            if (error || !data) {
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
        userId: string,
        earningsPercent: number
    ): Promise<ServiceResult<UserProfile, UserErrorCode>> {
        try {
            const { data, error } = await supabaseAdmin
                .from("users")
                .update({ earnings_percent: earningsPercent })
                .eq("id", userId)
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
}

export default new UserService()
