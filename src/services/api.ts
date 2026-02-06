import { Account, Status, WrappedData } from '@/types';
import { calculateStats } from '@/utils/stats';
import { resolveAccount, fetchStatuses } from './mastodon';
import { analyzeSentiment, regenerateVibe } from './ai';
import { WRAPPED_YEAR } from '@/constants';

export { regenerateVibe } from './ai';

/**
 * Main function to get wrapped data for multiple accounts
 */
export const getWrappedData = async (
    credentials: Array<{ instance: string; username: string; token?: string }>,
    onProgress: (msg: string) => void,
    onAccountResolved?: (avatarUrl: string) => void
): Promise<WrappedData> => {
    try {
        const targetYear = WRAPPED_YEAR;
        const resolvedAccounts: Account[] = [];
        const allPosts: Status[] = [];

        // Fetch posts for each credential
        for (let i = 0; i < credentials.length; i++) {
            const cred = credentials[i];
            if (!cred.instance || !cred.username) continue;

            onProgress(`[${i + 1}/${credentials.length}] 正在连接 ${cred.username}@${cred.instance}...`);

            try {
                const acc = await resolveAccount(cred.instance, cred.username, cred.token);
                resolvedAccounts.push(acc);

                if (i === 0 && onAccountResolved) {
                    onAccountResolved(acc.avatar);
                }

                onProgress(`[${i + 1}/${credentials.length}] 正在获取 ${targetYear} 年的帖子...`);

                const accountPosts = await fetchStatuses(cred.instance, acc.id, (count, warning) => {
                    const prefix = `[${i + 1}/${credentials.length}]`;
                    if (warning) {
                        onProgress(`${prefix} 已抓取 ${count} 条 ${warning}`);
                    } else {
                        onProgress(`${prefix} 已抓取 ${count} 条...`);
                    }
                }, cred.token);

                allPosts.push(...accountPosts);

            } catch (e) {
                if (e instanceof Error && (e.message.includes("抓取被迫中止") || e.message.includes("网络连接连续失败"))) {
                    throw e;
                }

                console.error(e);
                onProgress(`警告: 账号 ${cred.username} 处理失败，跳过。`);
            }
        }

        if (resolvedAccounts.length === 0) {
            throw new Error("未能找到任何有效账号，请检查输入。");
        }

        if (allPosts.length === 0) {
            throw new Error(`${targetYear} 年在所有提供的账号中都没有找到帖子。`);
        }

        // Sort merged posts by date (descending: newest first)
        allPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        onProgress("正在分析汇总数据...");

        const primaryCred = credentials[0];

        const stats = await calculateStats(
            resolvedAccounts[0],
            allPosts,
            resolvedAccounts,
            primaryCred.instance,
            resolveAccount,
            analyzeSentiment,
            primaryCred.token
        );

        return { stats };
    } catch (error: any) {
        console.error(error);
        throw error;
    }
};
