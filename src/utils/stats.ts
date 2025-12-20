import { Account, Status, YearStats } from '@/types';

/**
 * Find the longest thread from a list of posts
 */
export const findLongestThread = (posts: Status[], allAccountIds: Set<string>): { root: Status, length: number, posts: Status[] } | null => {
    const childrenMap = new Map<string, Status[]>();

    // We consider a post part of a "thread" if it replies to a post that is ALSO authored by one of "our" accounts.
    posts.forEach(p => {
        if (p.in_reply_to_id && p.in_reply_to_account_id && allAccountIds.has(p.in_reply_to_account_id)) {
            const parentId = p.in_reply_to_id;
            if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
            childrenMap.get(parentId)?.push(p);
        }
    });

    const memo = new Map<string, { depth: number, posts: Status[] }>();

    const getDeepest = (node: Status): { depth: number, posts: Status[] } => {
        if (memo.has(node.id)) return memo.get(node.id)!;

        const children = childrenMap.get(node.id);
        if (!children || children.length === 0) {
            const res = { depth: 1, posts: [node] };
            memo.set(node.id, res);
            return res;
        }

        let max = { depth: 0, posts: [] as Status[] };
        for (const child of children) {
            const res = getDeepest(child);
            if (res.depth > max.depth) {
                max = res;
            }
        }

        const res = { depth: 1 + max.depth, posts: [node, ...max.posts] };
        memo.set(node.id, res);
        return res;
    };

    let best = { depth: 0, posts: [] as Status[] };
    const postsSet = new Set(posts.map(p => p.id));

    posts.forEach(p => {
        // A post is a root if its parent is NOT in the fetched posts set (or it has no parent)
        const isRoot = !p.in_reply_to_id || !postsSet.has(p.in_reply_to_id);
        if (isRoot) {
            const res = getDeepest(p);
            if (res.depth > best.depth) {
                best = res;
            }
        }
    });

    if (best.depth > 1) {
        return { root: best.posts[0], length: best.depth, posts: best.posts };
    }
    return null;
};

/**
 * Calculate statistics from posts
 */
export const calculateStats = async (
    primaryAccount: Account,
    posts: Status[],
    allAccounts: Account[],
    instance: string,
    resolveAccount: (instance: string, username: string, token?: string) => Promise<Account>,
    analyzeSentiment: (posts: Status[], username: string) => Promise<{ keyword: string, description: string, color: string }>,
    token?: string
): Promise<YearStats> => {
    let totalFavourites = 0;
    let totalReblogs = 0;
    let wordCount = 0;
    const hourMap = new Array(24).fill(0);
    const monthMap: Record<string, number> = {};
    const tagMap: Record<string, number> = {};
    const heatmapData: Record<string, number> = {};
    const friendMap: Record<string, number> = {};

    // Collect text for AI regeneration
    const postContentPool: string[] = [];

    // Create Sets for exclusion logic (exclude all owned accounts from friends list)
    const ownIds = new Set(allAccounts.map(a => a.id));
    const ownAccts = new Set(allAccounts.map(a => a.acct));

    posts.forEach(post => {
        totalFavourites += post.favourites_count;
        totalReblogs += post.reblogs_count;

        const textContent = post.content.replace(/<[^>]*>?/gm, '');

        // Add to pool if meaningful length
        if (textContent.length > 5) {
            postContentPool.push(textContent);
        }

        // Better word count for CJK (Chinese) + English
        const cjkCount = (textContent.match(/[\u4e00-\u9fa5]/g) || []).length;
        const nonCjkText = textContent.replace(/[\u4e00-\u9fa5]/g, ' ');
        const latinCount = nonCjkText.trim().split(/\s+/).filter(s => s.length > 0).length;

        wordCount += cjkCount + latinCount;

        const date = new Date(post.created_at);
        const dateKey = date.toISOString().split('T')[0];
        heatmapData[dateKey] = (heatmapData[dateKey] || 0) + 1;
        hourMap[date.getHours()]++;

        const monthKey = date.toLocaleString('default', { month: 'short' });
        monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;

        post.tags.forEach(tag => {
            tagMap[tag.name] = (tagMap[tag.name] || 0) + 1;
        });

        post.mentions.forEach(mention => {
            if (!ownIds.has(mention.id) && !ownAccts.has(mention.acct)) {
                friendMap[mention.acct] = (friendMap[mention.acct] || 0) + 1;
            }
        });
    });

    const sortedByFav = [...posts].sort((a, b) => b.favourites_count - a.favourites_count);
    const sortedByReblog = [...posts].sort((a, b) => b.reblogs_count - a.reblogs_count);
    const topFavoritedPosts = sortedByFav.slice(0, 3);
    const topRebloggedPosts = sortedByReblog.slice(0, 3);

    const longestThread = findLongestThread(posts, ownIds);

    const postsByHour = hourMap.map((count, hour) => ({ hour, count }));
    const postsByMonth = Object.entries(monthMap).map(([month, count]) => ({ month, count }));
    const mostActiveHour = postsByHour.reduce((max, curr) => curr.count > max.count ? curr : max, { hour: 0, count: -1 }).hour;

    const sortedMonths = [...postsByMonth].sort((a, b) => b.count - a.count);
    const mostActiveMonth = sortedMonths.length > 0 ? sortedMonths[0].month : 'N/A';

    const topTags = Object.entries(tagMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name]) => `#${name}`);

    // Fetch friend details
    const rawTopFriends = Object.entries(friendMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const topFriends = await Promise.all(rawTopFriends.map(async ([username, count]) => {
        try {
            const acc = await resolveAccount(instance, username, token);
            return { username, count, avatar: acc.avatar, display_name: acc.display_name };
        } catch (e) {
            return { username, count, avatar: '', display_name: username };
        }
    }));

    // Analyze Vibe
    const vibe = await analyzeSentiment(posts, primaryAccount.display_name);

    // Longest Streak calculation
    const dates = Object.keys(heatmapData).sort();
    let maxStreak = 0;
    let currentStreak = 0;
    let lastDateVal = 0;

    dates.forEach((d) => {
        const val = new Date(d).getTime();
        if (currentStreak === 0) {
            currentStreak = 1;
        } else {
            const diffDays = Math.round((val - lastDateVal) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                currentStreak++;
            } else {
                if (currentStreak > maxStreak) maxStreak = currentStreak;
                currentStreak = 1;
            }
        }
        lastDateVal = val;
    });
    if (currentStreak > maxStreak) maxStreak = currentStreak;

    // Latest Post & Rare Post
    let latestPost: Status | null = null;
    let maxTimeVal = -1;

    const activeHours = hourMap.map((c, h) => ({ h, c })).filter(x => x.c > 0);
    activeHours.sort((a, b) => a.c - b.c);
    const leastActiveHour = activeHours.length > 0 ? activeHours[0].h : -1;

    const rareCandidates: Status[] = [];

    posts.forEach(p => {
        const d = new Date(p.created_at);
        const h = d.getHours();
        const m = d.getMinutes();

        // Latest post: adjust 0-4 to 24-28
        const adjH = h < 4 ? h + 24 : h;
        const timeVal = adjH * 60 + m;

        if (timeVal > maxTimeVal) {
            maxTimeVal = timeVal;
            latestPost = p;
        }

        if (h === leastActiveHour) {
            rareCandidates.push(p);
        }
    });

    const rarePost = rareCandidates.length > 0
        ? rareCandidates[Math.floor(Math.random() * rareCandidates.length)]
        : null;

    return {
        year: new Date().getFullYear(),
        totalPosts: posts.length,
        totalFavourites,
        totalReblogs,
        mostActiveMonth,
        mostActiveHour,
        topTags,
        topFavoritedPosts,
        topRebloggedPosts,
        mostFavoritedPost: topFavoritedPosts[0] || null,
        mostRebloggedPost: topRebloggedPosts[0] || null,
        longestThread,
        account: primaryAccount,
        postsByHour,
        postsByMonth,
        heatmapData,
        topFriends,
        wordCount,
        firstPostDate: posts.length > 0 ? posts[posts.length - 1].created_at : new Date().toISOString(),
        vibeKeyword: vibe.keyword,
        vibeDescription: vibe.description,
        vibeColor: vibe.color,
        postContentPool,
        longestStreak: maxStreak,
        latestPost,
        rarePost,
        leastActiveHour
    };
};
