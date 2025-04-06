export type CharacterSchema = {
    id: string;
    user_id: string;
    name: string;
    bio: string | null;
    description: string | null;
    avatar_url: string | null;
    banner_url: string | null;
    public: boolean;
    created_at: string;
    updated_at: string;
    path: string;
    nsfw: boolean;
    tags: string;
    gender: string;
    appearance: string | null;
}

export type GeneratedCharacter = Pick<CharacterSchema, 'name' | 'gender' | 'description' | 'bio' | 'nsfw' | 'appearance'>;