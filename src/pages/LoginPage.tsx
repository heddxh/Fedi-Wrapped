import React, { useRef } from 'react';
import { Globe, User, Key, AlertCircle, Play, Plus, Trash2, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { AccountCredential } from '@/types';

interface LoginPageProps {
    accounts: AccountCredential[];
    showAdvanced: boolean;
    error: string | null;
    fontCss: string;
    onAddAccount: () => void;
    onRemoveAccount: (index: number) => void;
    onUpdateAccount: (index: number, field: keyof AccountCredential, value: string) => void;
    onToggleAdvanced: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onFileUpload?: (file: File) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
    accounts,
    showAdvanced,
    error,
    fontCss,
    onAddAccount,
    onRemoveAccount,
    onUpdateAccount,
    onToggleAdvanced,
    onSubmit,
    onFileUpload
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onFileUpload) {
            onFileUpload(file);
        }
    };

    return (
        <div className="min-h-[100dvh] w-full bg-slate-50 text-slate-900 flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100 via-white to-pink-50">
            {/* Inject fonts if loaded */}
            {fontCss && <style>{fontCss}</style>}
            <div className="w-full max-w-md md:max-w-lg space-y-6 md:space-y-8 animate-fade-in-up">
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-2 md:mb-4 tracking-tighter text-slate-900">Fedi Wrapped</h1>
                    <p className="text-slate-500 text-base md:text-lg">探索你的联邦宇宙年度足迹。</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100">
                    <div className="space-y-4 max-h-[40vh] md:max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {accounts.map((account, index) => (
                            <div key={account.id} className="relative p-4 rounded-xl border border-slate-200 bg-slate-50 transition-all hover:border-indigo-200">
                                {/* Remove Button (if more than 1) */}
                                {accounts.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => onRemoveAccount(index)}
                                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-1"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">实例地址 {index + 1}</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-3 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                value={account.instance}
                                                onChange={e => onUpdateAccount(index, 'instance', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-base text-slate-900 placeholder:text-slate-400"
                                                placeholder="mastodon.social"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">用户名 {index + 1}</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                value={account.username}
                                                onChange={e => onUpdateAccount(index, 'username', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-base text-slate-900 placeholder:text-slate-400"
                                                placeholder="yourname"
                                            />
                                        </div>
                                    </div>

                                    {/* Token Input per account (Visible if advanced is toggled) */}
                                    {showAdvanced && (
                                        <div className="animate-fade-in-up">
                                            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">访问令牌 (可选)</label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-3 text-slate-400" size={16} />
                                                <input
                                                    type="password"
                                                    value={account.token}
                                                    onChange={e => onUpdateAccount(index, 'token', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-base text-slate-900 placeholder:text-slate-400"
                                                    placeholder="Token..."
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={onAddAccount}
                        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                        <Plus size={20} /> 添加另一个账号
                    </button>

                    {/* Advanced Toggle */}
                    <div className="pt-2 flex justify-center">
                        <button
                            type="button"
                            onClick={onToggleAdvanced}
                            className="flex items-center gap-2 text-xs text-slate-500 hover:text-indigo-600 transition-colors font-medium bg-slate-100 px-4 py-2 rounded-full"
                        >
                            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {showAdvanced ? "隐藏 Token 输入" : "我的实例需要登录 (显示 Token 输入)"}
                        </button>
                    </div>

                    {showAdvanced && (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-700 font-medium">
                            如果你的实例是私有的或返回 401 错误，请为对应账号填写"只读 (Read Only)"访问令牌。
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 animate-fade-in-up">
                            <AlertCircle className="text-red-500 shrink-0" size={20} />
                            <p className="text-sm text-red-600 font-medium leading-relaxed">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white font-bold py-3 md:py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 text-base md:text-lg shadow-xl hover:shadow-2xl hover:bg-black mt-4"
                    >
                        <Play size={24} fill="white" /> 生成年度总结
                    </button>
                    <p className="text-xs text-center text-slate-400 pt-2">
                        数据仅在本地处理。我们不会存储你的令牌。
                    </p>

                    {/* File Upload Fallback */}
                    {onFileUpload && (
                        <div className="pt-4 border-t border-slate-100 mt-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {/* Check if at least one valid account is filled */}
                            {accounts.some(a => a.instance?.includes('.') && a.username) ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-2.5 border border-indigo-200 bg-indigo-50 rounded-xl text-indigo-600 font-medium hover:border-indigo-400 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Upload size={16} />
                                        上传导出文件（使用上方账号信息）
                                    </button>
                                    <p className="text-xs text-center text-slate-400 pt-2">
                                        支持 Mastodon outbox.json / Misskey notes.json
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-full py-2.5 border border-dashed border-slate-200 rounded-xl text-slate-400 font-medium flex items-center justify-center gap-2 text-sm">
                                        <Upload size={16} />
                                        上传导出文件
                                    </div>
                                    <p className="text-xs text-center text-amber-600 pt-2">
                                        ⚠️ 请先填写上方的实例地址和用户名，以便获取头像
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};
