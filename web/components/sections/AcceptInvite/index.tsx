'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInviteAction, InviteInfo } from "@/lib/actions/projects";
import { Spinner } from "@/components/ui/spinner";
import { Check, X, Users, LogIn } from "lucide-react";

interface AcceptInviteProps {
    token: string;
    inviteInfo: InviteInfo | null;
    error: string | null;
}

export function AcceptInvite({ token, inviteInfo, error }: AcceptInviteProps) {
    const router = useRouter();
    const [isAccepting, setIsAccepting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleAccept = async () => {
        if (isAccepting) return;

        setIsAccepting(true);

        try {
            const response = await acceptInviteAction(token);

            if (response.success) {
                setResult({ success: true, message: "Convite aceito com sucesso!" });
                setTimeout(() => {
                    router.push("/dashboard");
                }, 1500);
            } else {
                setResult({ success: false, message: response.error ?? "Erro ao aceitar convite" });
            }
        } catch (err) {
            console.error("Erro ao aceitar convite:", err);
            setResult({ success: false, message: "Ocorreu um erro inesperado" });
        } finally {
            setIsAccepting(false);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAFAFE] to-[#F1F0F7] p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                        <X className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800 mb-2">Convite Inválido</h1>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full h-12 px-4 rounded-xl bg-[#1F108E] font-bold text-sm text-white cursor-pointer transition-all duration-300 hover:bg-[#100752]"
                    >
                        Ir para o Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAFAFE] to-[#F1F0F7] p-4">
                <div className={`w-full max-w-md bg-white rounded-2xl shadow-lg border p-8 text-center ${
                    result.success ? 'border-emerald-100' : 'border-red-100'
                }`}>
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        result.success ? 'bg-emerald-50' : 'bg-red-50'
                    }`}>
                        {result.success ? (
                            <Check className="w-8 h-8 text-emerald-500" />
                        ) : (
                            <X className="w-8 h-8 text-red-500" />
                        )}
                    </div>
                    <h1 className={`text-xl font-bold mb-2 ${
                        result.success ? 'text-emerald-600' : 'text-gray-800'
                    }`}>
                        {result.success ? "Sucesso!" : "Erro"}
                    </h1>
                    <p className="text-gray-500 mb-6">{result.message}</p>
                    {result.success && (
                        <p className="text-sm text-gray-400">Redirecionando para o dashboard...</p>
                    )}
                    {!result.success && (
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="w-full h-12 px-4 rounded-xl bg-[#1F108E] font-bold text-sm text-white cursor-pointer transition-all duration-300 hover:bg-[#100752]"
                        >
                            Ir para o Dashboard
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAFAFE] to-[#F1F0F7] p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-[#F1F0F7] p-8">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-[#F1F0F7] rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-[#1F108E]" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-[#100752] mb-2">Convite de Projeto</h1>
                    <p className="text-gray-500">Você foi convidado para participar de um projeto</p>
                </div>

                {inviteInfo && (
                    <div className="bg-[#FAFAFE] rounded-xl p-4 mb-6 border border-[#F1F0F7]">
                        <h2 className="font-bold text-[#100752] mb-1">{inviteInfo.project.name}</h2>
                        {inviteInfo.project.description && (
                            <div 
                                dangerouslySetInnerHTML={{ __html: inviteInfo?.project?.description ?? "" }}
                                className="text-sm lg:text-base text-gray-500 font-medium max-w-2xl break-words leading-relaxed"
                            />
                        )}
                        {inviteInfo.invitedBy && (
                            <p className="text-xs text-gray-400">
                                Convidado por <span className="font-semibold text-gray-600">{inviteInfo.invitedBy.name}</span>
                            </p>
                        )}
                    </div>
                )}

                <button
                    onClick={handleAccept}
                    disabled={isAccepting}
                    className={`w-full h-12 px-4 rounded-xl font-bold text-sm text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                        isAccepting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-[#1F108E] hover:bg-[#100752] hover:shadow-lg hover:shadow-[#1f108e]/20'
                    }`}
                >
                    {isAccepting ? (
                        <>
                            <Spinner size={20} className="text-white" />
                            <span>Aceitando...</span>
                        </>
                    ) : (
                        <>
                            <LogIn className="w-5 h-5" />
                            <span>Aceitar Convite</span>
                        </>
                    )}
                </button>

                <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full h-12 px-4 mt-3 rounded-xl border border-gray-200 font-bold text-sm text-gray-600 cursor-pointer transition-all duration-300 hover:bg-gray-50"
                >
                    Recusar
                </button>
            </div>
        </div>
    );
}