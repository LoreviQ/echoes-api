export type NsfwFilter = 'show' | 'blur' | 'hide';

export type UserPreferencesSchema = {
    user_id: string;
    nsfw_filter: NsfwFilter;
}

// default preferences
export const DEFAULT_USER_PREFERENCES: UserPreferencesSchema = {
    user_id: '',
    nsfw_filter: 'hide'
}