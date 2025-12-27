import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL('/?auth_error=' + error, request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/?auth_error=no_code', request.url));
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: GOOGLE_REDIRECT_URI,
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('Token exchange failed:', errorData);
            return NextResponse.redirect(new URL('/?auth_error=token_exchange_failed', request.url));
        }

        const tokens = await tokenResponse.json();

        // Redirect back to the app with tokens in URL (they'll be stored client-side temporarily)
        // In production, you'd want to store these server-side in a session/database
        const redirectUrl = new URL('/', request.url);
        redirectUrl.searchParams.set('google_auth_success', 'true');
        redirectUrl.searchParams.set('access_token', tokens.access_token);
        if (tokens.refresh_token) {
            redirectUrl.searchParams.set('refresh_token', tokens.refresh_token);
        }
        redirectUrl.searchParams.set('expires_in', tokens.expires_in);

        return NextResponse.redirect(redirectUrl);
    } catch (err) {
        console.error('OAuth callback error:', err);
        return NextResponse.redirect(new URL('/?auth_error=callback_failed', request.url));
    }
}
