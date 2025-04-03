import supabase from '../../config/supabase';
import { generatePostForCharacter } from '../ai_generation/content';

export class PostService {
    private postGenerationInterval: NodeJS.Timeout | null = null;
    private isInitialized: boolean = false;
    private intervalMs: number = 5 * 60 * 1000; // 5 minutes in milliseconds

    /**
     * Initialize the post generation service
     */
    public init(): void {
        if (this.isInitialized) {
            console.log('Post generation service already initialized');
            return;
        }

        this.setupPostGeneration();
        this.isInitialized = true;
        console.log('Post generation service initialized, will generate posts every 5 minutes');
    }

    /**
     * Set up the interval for automatic post generation
     */
    private setupPostGeneration(): void {
        // Generate one post immediately on startup
        this.generateRandomPost();

        // Set up interval for future posts
        this.postGenerationInterval = setInterval(() => {
            this.generateRandomPost();
        }, this.intervalMs);
    }

    /**
     * Generate a post for a randomly selected character
     */
    private async generateRandomPost(): Promise<void> {
        try {
            // Get all characters from the database
            const { data: characters, error } = await supabase
                .from('characters')
                .select('id')
                .order('id'); // We could add frequency/weight columns later

            if (error || !characters || characters.length === 0) {
                console.error('Error fetching characters or no characters found:', error);
                return;
            }

            // Simple random selection for now
            // In the future, this could be weighted by a frequency column
            const randomIndex = Math.floor(Math.random() * characters.length);
            const selectedCharacter = characters[randomIndex];

            console.log(`Generating post for character: ${selectedCharacter.id}`);

            // Generate and save the post
            const post = await generatePostForCharacter(selectedCharacter.id);

            if (post) {
                console.log(`Successfully generated post: ${post.id}`);
            } else {
                console.error('Failed to generate post');
            }
        } catch (error) {
            console.error('Error in automatic post generation:', error);
        }
    }

    /**
     * Clean up when service is stopped
     */
    public cleanup(): void {
        if (this.postGenerationInterval) {
            clearInterval(this.postGenerationInterval);
            this.postGenerationInterval = null;
            this.isInitialized = false;
            console.log('Post generation service stopped');
        }
    }
}

// Singleton instance
export const postService = new PostService(); 