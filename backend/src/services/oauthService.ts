import { prisma } from '../lib/prisma'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import axios from 'axios'

interface OAuthUser {
    id: string
    email: string
    name: string
    picture?: string
    provider: 'google' | 'facebook'
}

class OAuthService {
    // Generate OAuth URLs
    static getGoogleAuthUrl(): string {
        const clientId = process.env.GOOGLE_CLIENT_ID
        const redirectUri = process.env.GOOGLE_CALLBACK_URL
        const scope = 'email profile'

        if (!clientId || !redirectUri) {
            throw new Error('Google OAuth not configured')
        }

        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            scope: scope,
            response_type: 'code',
            access_type: 'offline'
        })

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    }

    static getFacebookAuthUrl(): string {
        const appId = process.env.FACEBOOK_APP_ID
        const redirectUri = process.env.FACEBOOK_CALLBACK_URL
        const scope = 'email public_profile'

        if (!appId || !redirectUri) {
            throw new Error('Facebook OAuth not configured')
        }

        const params = new URLSearchParams({
            client_id: appId,
            redirect_uri: redirectUri,
            scope: scope,
            response_type: 'code'
        })

        return `https://www.facebook.com/v12.0/dialog/oauth?${params.toString()}`
    }

    // Handle OAuth callbacks
    static async handleGoogleCallback(code: string) {
        try {
            const clientId = process.env.GOOGLE_CLIENT_ID
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET
            const redirectUri = process.env.GOOGLE_CALLBACK_URL

            if (!clientId || !clientSecret || !redirectUri) {
                throw new Error('Google OAuth not configured')
            }

            // Exchange code for access token
            const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri
            })

            const { access_token } = tokenResponse.data

            // Get user profile
            const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` }
            })

            const profile = profileResponse.data
            return await this.findOrCreateUser({
                id: profile.id,
                email: profile.email,
                name: profile.name,
                picture: profile.picture,
                provider: 'google'
            })
        } catch (error) {
            console.error('Google OAuth callback error:', error)
            throw new Error('Google authentication failed')
        }
    }

    static async handleFacebookCallback(code: string) {
        try {
            const appId = process.env.FACEBOOK_APP_ID
            const appSecret = process.env.FACEBOOK_APP_SECRET
            const redirectUri = process.env.FACEBOOK_CALLBACK_URL

            if (!appId || !appSecret || !redirectUri) {
                throw new Error('Facebook OAuth not configured')
            }

            // Exchange code for access token
            const tokenResponse = await axios.get('https://graph.facebook.com/v12.0/oauth/access_token', {
                params: {
                    client_id: appId,
                    client_secret: appSecret,
                    code: code,
                    redirect_uri: redirectUri
                }
            })

            const { access_token } = tokenResponse.data

            // Get user profile
            const profileResponse = await axios.get('https://graph.facebook.com/me', {
                params: {
                    fields: 'id,name,email,picture',
                    access_token: access_token
                }
            })

            const profile = profileResponse.data
            return await this.findOrCreateUser({
                id: profile.id,
                email: profile.email,
                name: profile.name,
                picture: profile.picture?.data?.url,
                provider: 'facebook'
            })
        } catch (error) {
            console.error('Facebook OAuth callback error:', error)
            throw new Error('Facebook authentication failed')
        }
    }

    static async handleGoogleLogin(profile: any) {
        try {
            const oauthUser: OAuthUser = {
                id: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                picture: profile.photos[0]?.value,
                provider: 'google'
            }

            return await this.findOrCreateUser(oauthUser)
        } catch (error) {
            console.error('Google OAuth error:', error)
            throw new Error('Google authentication failed')
        }
    }

    static async handleFacebookLogin(profile: any) {
        try {
            const oauthUser: OAuthUser = {
                id: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                picture: profile.photos[0]?.value,
                provider: 'facebook'
            }

            return await this.findOrCreateUser(oauthUser)
        } catch (error) {
            console.error('Facebook OAuth error:', error)
            throw new Error('Facebook authentication failed')
        }
    }

    private static async findOrCreateUser(oauthUser: OAuthUser) {
        // Check if user exists by email
        let user = await prisma.user.findUnique({
            where: { email: oauthUser.email }
        })

        if (user) {
            // User exists, update OAuth info
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    socialProvider: oauthUser.provider,
                    socialId: oauthUser.id,
                    emailVerified: true, // OAuth users are pre-verified
                }
            })
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    name: oauthUser.name,
                    email: oauthUser.email,
                    passwordHash: await bcrypt.hash(Math.random().toString(36), 10), // Random password for OAuth users
                    socialProvider: oauthUser.provider,
                    socialId: oauthUser.id,
                    emailVerified: true,
                    role: 'customer'
                }
            })
        }

        // Generate JWT token
        const exp = process.env.JWT_EXPIRES_IN || '7d'
        const options: jwt.SignOptions = { expiresIn: exp as any }
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET!,
            options
        )

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                emailVerified: user.emailVerified,
                socialProvider: user.socialProvider,
                createdAt: user.createdAt
            },
            token
        }
    }

    static generateToken(user: any) {
        const exp = process.env.JWT_EXPIRES_IN || '7d'
        const options: jwt.SignOptions = { expiresIn: exp as any }
        return jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET!,
            options
        )
    }
}

export default OAuthService 