import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";

// Simple in-memory rate limiting (per email, 60s cooldown)
const lastSent = new Map<string, number>();

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Email wajib diisi" },
                { status: 400 },
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Rate limit check
        const lastTime = lastSent.get(normalizedEmail);
        if (lastTime && Date.now() - lastTime < 60_000) {
            const remaining = Math.ceil((60_000 - (Date.now() - lastTime)) / 1000);
            return NextResponse.json(
                { error: `Tunggu ${remaining} detik sebelum mengirim ulang.` },
                { status: 429 },
            );
        }

        const admin = createAdminClient();

        // Look up user by email in profiles table
        const { data: userData } = await admin
            .from("profiles")
            .select("id, email")
            .eq("email", normalizedEmail)
            .maybeSingle();

        if (!userData) {
            // Don't reveal whether email exists — still show success
            return NextResponse.json({ success: true });
        }

        // Check if already verified
        const { data: authUser } = await admin.auth.admin.getUserById(userData.id);

        if (authUser?.user?.email_confirmed_at) {
            return NextResponse.json({
                success: true,
                alreadyVerified: true,
                message: "Email sudah terverifikasi. Silakan login.",
            });
        }

        // Use inviteUserByEmail to send verification email
        const origin = (await headers()).get("origin") || "";
        const redirectTo = `${origin}/auth/confirm?next=/dashboard`;

        const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(
            normalizedEmail,
            { redirectTo },
        );

        if (inviteError) {
            console.error("Invite error:", inviteError.message);

            // If invite fails (user may already exist in invited state),
            // try updating user to re-trigger
            const { error: updateError } = await admin.auth.admin.updateUserById(
                userData.id,
                { email_confirm: false },
            );

            if (updateError) {
                console.error("Update user error:", updateError);
            }

            // Retry invite
            const { error: retryError } = await admin.auth.admin.inviteUserByEmail(
                normalizedEmail,
                { redirectTo },
            );

            if (retryError) {
                console.error("Retry invite error:", retryError);
                return NextResponse.json(
                    { error: "Gagal mengirim email verifikasi. Coba lagi nanti." },
                    { status: 500 },
                );
            }
        }

        // Update rate limit
        lastSent.set(normalizedEmail, Date.now());

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Resend verification error:", err);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 },
        );
    }
}
