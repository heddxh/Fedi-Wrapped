import { Status, Account } from '@/types';
import { WRAPPED_YEAR } from '@/constants';

/**
 * ActivityPub Activity object (Mastodon outbox.json)
 */
interface ActivityPubActivity {
    type: string;
    published?: string;
    object?: {
        type?: string;
        content?: string;
        published?: string;
        url?: string;
        id?: string;
        inReplyTo?: string | null;
        tag?: Array<{ type: string; name: string; href?: string }>;
        attachment?: Array<{
            type: string;
            mediaType?: string;
            url?: string;
        }>;
    };
}

/**
 * Mastodon outbox.json structure
 */
interface MastodonOutbox {
    orderedItems?: ActivityPubActivity[];
    items?: ActivityPubActivity[];
}

/**
 * Misskey note structure
 */
interface MisskeyNote {
    id: string;
    createdAt: string;
    text?: string | null;
    replyId?: string | null;
    renoteId?: string | null;
    files?: Array<{
        id: string;
        type: string;
        url?: string;
    }>;
    tags?: string[];
    mentions?: string[];
}

/**
 * Parse result type
 */
export interface ParseResult {
    posts: Status[];
    account: Account;
    source: 'mastodon' | 'misskey';
}

/**
 * Detect file format and parse accordingly
 */
export const parseExportFile = async (file: File): Promise<ParseResult> => {
    const text = await file.text();
    const data = JSON.parse(text);

    // Detect format
    if (data.orderedItems || data.items) {
        // Mastodon ActivityPub format
        return parseMastodonOutbox(data, file.name);
    } else if (Array.isArray(data) && data.length > 0 && data[0].createdAt) {
        // Misskey notes array
        return parseMisskeyNotes(data, file.name);
    }

    throw new Error('无法识别的导出文件格式。请上传 Mastodon 的 outbox.json 或 Misskey 的 notes.json。');
};

/**
 * Parse Mastodon outbox.json
 */
const parseMastodonOutbox = (data: MastodonOutbox, filename: string): ParseResult => {
    const items = data.orderedItems || data.items || [];
    const startOfYear = new Date(Date.UTC(WRAPPED_YEAR, 0, 1, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(WRAPPED_YEAR, 11, 31, 23, 59, 59));

    const posts: Status[] = [];

    for (const activity of items) {
        // Only process Create activities with Note objects
        if (activity.type !== 'Create' || activity.object?.type !== 'Note') {
            continue;
        }

        const obj = activity.object;
        const published = obj.published || activity.published;
        if (!published) continue;

        const postDate = new Date(published);
        if (postDate < startOfYear || postDate > endOfYear) continue;

        // Extract hashtags
        const tags = (obj.tag || [])
            .filter(t => t.type === 'Hashtag')
            .map(t => ({ name: t.name?.replace(/^#/, '') || '' }));

        // Extract mentions
        const mentions = (obj.tag || [])
            .filter(t => t.type === 'Mention')
            .map(t => ({
                id: '',
                username: t.name?.replace(/^@/, '') || '',
                acct: t.name?.replace(/^@/, '') || '',
                url: t.href || ''
            }));

        // Extract media
        const media_attachments = (obj.attachment || [])
            .filter(a => ['Image', 'Video', 'Audio'].includes(a.type))
            .map(a => ({
                id: '',
                type: (a.type.toLowerCase() === 'image' ? 'image' :
                    a.type.toLowerCase() === 'video' ? 'video' : 'audio') as 'image' | 'video' | 'audio',
                url: a.url || '',
                preview_url: a.url || '',
                description: '',
                blurhash: ''
            }));

        posts.push({
            id: obj.id || `${Date.now()}-${Math.random()}`,
            created_at: published,
            content: obj.content || '',
            replies_count: 0,
            reblogs_count: 0,
            favourites_count: 0,
            url: obj.url || obj.id || '',
            media_attachments,
            mentions,
            tags,
            in_reply_to_id: obj.inReplyTo || null,
            in_reply_to_account_id: null
        });
    }

    // Sort by date descending
    posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
        posts,
        account: createPlaceholderAccount(filename, 'Mastodon', posts.length),
        source: 'mastodon'
    };
};

/**
 * Parse Misskey notes.json
 */
const parseMisskeyNotes = (data: MisskeyNote[], filename: string): ParseResult => {
    const startOfYear = new Date(Date.UTC(WRAPPED_YEAR, 0, 1, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(WRAPPED_YEAR, 11, 31, 23, 59, 59));

    const posts: Status[] = [];

    for (const note of data) {
        // Skip renotes (reblogs) without text
        if (note.renoteId && !note.text) continue;

        const postDate = new Date(note.createdAt);
        if (postDate < startOfYear || postDate > endOfYear) continue;

        // Extract tags
        const tags = (note.tags || []).map(t => ({ name: t }));

        // Extract media
        const media_attachments = (note.files || []).map(f => ({
            id: f.id,
            type: (f.type?.startsWith('image') ? 'image' :
                f.type?.startsWith('video') ? 'video' :
                    f.type?.startsWith('audio') ? 'audio' : 'unknown') as 'image' | 'video' | 'audio' | 'unknown',
            url: f.url || '',
            preview_url: f.url || '',
            description: '',
            blurhash: ''
        }));

        posts.push({
            id: note.id,
            created_at: note.createdAt,
            content: note.text ? `<p>${escapeHtml(note.text)}</p>` : '',
            replies_count: 0,
            reblogs_count: 0,
            favourites_count: 0,
            url: '',
            media_attachments,
            mentions: [],
            tags,
            in_reply_to_id: note.replyId || null,
            in_reply_to_account_id: null
        });
    }

    // Sort by date descending
    posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
        posts,
        account: createPlaceholderAccount(filename, 'Misskey', posts.length),
        source: 'misskey'
    };
};

/**
 * Create a placeholder account for imported data
 */
const createPlaceholderAccount = (filename: string, platform: string, postCount: number): Account => ({
    id: 'imported',
    username: `${platform} 导入`,
    acct: `${platform} 导入`,
    display_name: `${platform} 用户`,
    avatar: '',
    header: '',
    followers_count: 0,
    following_count: 0,
    statuses_count: postCount,
    url: ''
});

/**
 * Escape HTML for Misskey text content
 */
const escapeHtml = (text: string): string => {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br>');
};
