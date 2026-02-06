import { Account, Status } from '@/types';
import { getHeaders } from '@/utils/helpers';
import { WRAPPED_YEAR } from '@/constants';

/**
 * Resolve account information from instance and username
 */
export const resolveAccount = async (instanceUrl: string, username: string, token?: string): Promise<Account> => {
    const cleanInstance = instanceUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const cleanUsername = username.trim().replace(/^@/, '');

    const lookupUrl = `https://${cleanInstance}/api/v1/accounts/lookup?acct=${encodeURIComponent(cleanUsername)}`;

    try {
        const response = await fetch(lookupUrl, { headers: getHeaders(token) });
        if (response.ok) {
            const acc = await response.json();
            console.log(`[resolveAccount] Found ${cleanUsername} via lookup:`, acc.avatar ? 'has avatar' : 'no avatar');
            return acc;
        }
        console.log(`[resolveAccount] Lookup failed for ${cleanUsername}: ${response.status}`);
    } catch (error) {
        console.log(`[resolveAccount] Lookup error for ${cleanUsername}:`, error);
    }

    const searchUrl = `https://${cleanInstance}/api/v1/accounts/search?q=${encodeURIComponent(cleanUsername)}&limit=1`;
    try {
        const response = await fetch(searchUrl, { headers: getHeaders(token) });
        if (response.ok) {
            const results = await response.json();
            const accounts = Array.isArray(results) ? results : (results.accounts || []);
            if (accounts.length > 0) {
                console.log(`[resolveAccount] Found ${cleanUsername} via search:`, accounts[0].avatar ? 'has avatar' : 'no avatar');
                return accounts[0];
            }
        }
        console.log(`[resolveAccount] Search failed for ${cleanUsername}: ${response.status}`);
    } catch (error) {
        console.log(`[resolveAccount] Search error for ${cleanUsername}:`, error);
    }

    // Fallback mock if completely fails
    console.log(`[resolveAccount] Using fallback for ${cleanUsername}`);
    return {
        id: '0',
        username: cleanUsername.split('@')[0], // Extract just the username part
        acct: cleanUsername,
        display_name: cleanUsername.split('@')[0],
        avatar: '',
        header: '',
        followers_count: 0,
        following_count: 0,
        statuses_count: 0,
        url: ''
    };
};

/**
 * Fetch statuses for a specific account
 */
export const fetchStatuses = async (
    instanceUrl: string,
    accountId: string,
    progressCallback: (count: number, warning?: string) => void,
    token?: string
): Promise<Status[]> => {
    const cleanInstance = instanceUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const LIMIT = 80;
    const startOfYear = new Date(Date.UTC(WRAPPED_YEAR, 0, 1, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(WRAPPED_YEAR, 11, 31, 23, 59, 59));

    let posts: Status[] = [];
    let maxId: string | null = null;
    let keepFetching = true;
    let consecutiveErrors = 0;

    // Adaptive rate limiting
    const BASE_DELAY = 100;
    const MAX_DELAY = 500;
    let currentDelay = BASE_DELAY;
    let consecutiveSuccesses = 0;

    while (keepFetching) {
        let url = `https://${cleanInstance}/api/v1/accounts/${accountId}/statuses?limit=${LIMIT}&exclude_replies=false`;
        if (maxId) {
            url += `&max_id=${maxId}`;
        }

        try {
            const response = await fetch(url, { headers: getHeaders(token) });

            // Handle Rate Limiting (429)
            if (response.status === 429) {
                consecutiveErrors = 0;
                const retryHeader = response.headers.get('Retry-After');
                let waitSeconds = 60;

                if (retryHeader) {
                    if (/^\d+$/.test(retryHeader)) {
                        waitSeconds = parseInt(retryHeader, 10);
                    } else {
                        const date = new Date(retryHeader);
                        const diff = (date.getTime() - Date.now()) / 1000;
                        if (diff > 0) waitSeconds = Math.ceil(diff);
                    }
                }

                if (waitSeconds < 1) waitSeconds = 5;
                if (waitSeconds > 300) waitSeconds = 300;

                let remaining = waitSeconds;
                const interval = setInterval(() => {
                    remaining--;
                    if (remaining > 0) {
                        progressCallback(posts.length, `触发流控 (429)，等待 ${remaining}s 后继续...`);
                    }
                }, 1000);

                progressCallback(posts.length, `触发流控 (429)，等待 ${waitSeconds}s 后继续...`);
                await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
                clearInterval(interval);

                // Increase delay after rate limit
                currentDelay = MAX_DELAY;
                consecutiveSuccesses = 0;

                continue;
            }

            if (!response.ok) {
                console.warn(`Fetch error ${response.status}: ${response.statusText}`);

                if ([401, 403, 404].includes(response.status)) {
                    progressCallback(posts.length, `访问受限 (${response.status})，停止获取此账号。`);
                    break;
                }

                consecutiveErrors++;
                if (consecutiveErrors > 3) {
                    throw new Error("由于连接频繁不稳定或服务器限制，抓取被迫中止。请稍候再试。");
                }

                progressCallback(posts.length, `服务器忙 (${response.status})，稍后重试...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                continue;
            }

            consecutiveErrors = 0;
            consecutiveSuccesses++;

            // Gradually reduce delay after consecutive successes
            if (consecutiveSuccesses >= 10 && currentDelay > BASE_DELAY) {
                currentDelay = Math.max(BASE_DELAY, currentDelay - 50);
                consecutiveSuccesses = 0;
            }

            const chunk: Status[] = await response.json();
            if (chunk.length === 0) break;

            const lastPost = chunk[chunk.length - 1];
            const lastPostDate = new Date(lastPost.created_at);

            for (const post of chunk) {
                const postDate = new Date(post.created_at);
                if (postDate > endOfYear) continue;
                if (postDate < startOfYear) {
                    keepFetching = false;
                    break;
                }
                posts.push(post);
            }

            const dateStr = lastPostDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
            progressCallback(posts.length, `(回溯至: ${dateStr})`);

            maxId = lastPost.id;

            await new Promise(resolve => setTimeout(resolve, currentDelay));

        } catch (e) {
            if (e instanceof Error && e.message.includes("抓取被迫中止")) {
                throw e;
            }

            console.error("Error fetching status page:", e);
            consecutiveErrors++;
            if (consecutiveErrors > 3) {
                throw new Error("网络连接连续失败，请检查网络或稍候再试。");
            }
            progressCallback(posts.length, "网络错误，3秒后重试...");
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    return posts;
};
