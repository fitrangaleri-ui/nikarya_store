"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "../(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus, MailCheck } from "lucide-react";

// 1. Definisikan tipe data state secara eksplisit
type RegisterState = {
  error?: string;
  success?: boolean;
} | null;

export default function RegisterPage() {
  // 2. Gunakan tipe data tersebut pada useActionState
  const [state, formAction, isPending] = useActionState<
    RegisterState,
    FormData
  >(async (prevState: RegisterState, formData: FormData) => {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      return { error: "Password dan konfirmasi password tidak cocok." };
    }

    if (password.length < 6) {
      return { error: "Password minimal 6 karakter." };
    }

    // Pastikan fungsi register di actions.ts mengembalikan object yang sesuai
    const result = await register(formData);

    // Mengubah kembalian 'undefined' menjadi 'null' agar sesuai tipe data
    return result || null;
  }, null);

  // 3. Sekarang TypeScript tahu bahwa state bisa punya properti success
  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md border-slate-200 bg-white shadow-lg text-center p-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <MailCheck className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
            Cek Email Anda
          </CardTitle>
          <CardDescription className="text-slate-600 mb-6">
            Kami telah mengirimkan link verifikasi ke alamat email yang Anda
            daftarkan. Silakan klik link tersebut untuk mengaktifkan akun.
          </CardDescription>
          <Button
            asChild
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Link href="/login">Kembali ke Halaman Login</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-slate-200 bg-white shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Buat Akun Baru
          </CardTitle>
          <CardDescription className="text-slate-500">
            Isi form di bawah ini untuk mendaftar
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            {state?.error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-700">
                Nama Lengkap
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Jhon Doe"
                required
                className="border-slate-300 bg-white text-slate-900 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
                className="border-slate-300 bg-white text-slate-900 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="border-slate-300 bg-white text-slate-900 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700">
                Konfirmasi Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                className="border-slate-300 bg-white text-slate-900 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              disabled={isPending}
            >
              {isPending ? "Memproses..." : "Daftar Akun"}
            </Button>
            <p className="text-center text-sm text-slate-600">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-500 hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
