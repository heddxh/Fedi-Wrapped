export interface Account {
    id: string;
    username: string;
    acct: string;
    display_name: string;
    avatar: string;
    header: string;
    followers_count: number;
    following_count: number;
    statuses_count: number;
    url: string;
}

export interface MediaAttachment {
    id: string;
    type: 'image' | 'video' | 'gifv' | 'audio' | 'unknown';
    url: string;
    preview_url: string;
    description: string;
    blurhash: string;
}

export interface Status {
    id: string;
    created_at: string;
    content: string; // HTML string
    replies_count: number;
    reblogs_count: number;
    favourites_count: number;
    url: string;
    reblog?: Status | null;
    media_attachments: MediaAttachment[];
    mentions: { id: string; username: string; acct: string; url: string }[];
    tags: { name: string }[];
    in_reply_to_id: string | null;
    in_reply_to_account_id: string | null;
}

export interface YearStats {
    year: number;
    totalPosts: number;
    totalFavourites: number;
    totalReblogs: number;
    mostActiveMonth: string;
    mostActiveHour: number;
    topTags: string[];

    // New Top Lists
    topFavoritedPosts: Status[];
    topRebloggedPosts: Status[];

    // Thread
    longestThread: {
        root: Status;
        length: number;
        posts: Status[];
    } | null;

    account: Account;
    postsByHour: { hour: number; count: number }[];
    postsByMonth: { month: string; count: number }[];
    heatmapData: Record<string, number>; // YYYY-MM-DD -> count
    topFriends: { username: string; count: number; avatar?: string; display_name?: string }[];
    wordCount: number;
    firstPostDate: string;
    mostFavoritedPost: Status | null;
    mostRebloggedPost: Status | null;

    // AI Sentiment
    vibeKeyword: string;
    vibeDescription: string;
    vibeColor: string; // Tailwind gradient class
    postContentPool: string[]; // Store raw text for regeneration

    // New Requested Stats
    longestStreak: number;
    latestPost: Status | null;
    rarePost: Status | null;
    leastActiveHour: number;
}

export interface WrappedData {
    stats: YearStats;
}

// Account Credential Type for login state
export interface AccountCredential {
    instance: string;
    username: string;
    token: string;
    id: string; // for React list keys
}
