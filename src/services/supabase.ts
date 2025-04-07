import supabase from '@/config/supabase';

interface GenerationRecord {
    model: string;
    prompt: string;
    systemInstruction: string;
    output: string;
}

export async function recordGeneration(generation: GenerationRecord): Promise<void> {
    try {
        console.log("Recording generation:", generation);
        const { data, error } = await supabase
            .from('generations')
            .insert(generation);

        if (error) {
            throw error;
        }

        console.log("Generation recorded successfully:", data);
    } catch (error) {
        console.error('Error recording generation:', error);
        throw error;
    }
}

/**
 * Uploads a buffer to Supabase storage and returns the public URL
 * @param buffer The buffer to upload
 * @param bucketName The name of the storage bucket
 * @param filePath The path where the file should be stored
 * @param contentType The content type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadToStorage(
    buffer: Buffer,
    bucketName: string,
    filePath: string,
    contentType: string = 'image/png'
): Promise<string> {
    try {
        // Upload to Supabase storage
        const { error: uploadError } = await supabase
            .storage
            .from(bucketName)
            .upload(filePath, buffer, {
                contentType,
                upsert: true
            });

        if (uploadError) {
            throw new Error(`Failed to upload to storage: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from(bucketName)
            .getPublicUrl(filePath);

        console.log(`Uploaded to Supabase storage: ${publicUrl}`);
        return publicUrl;
    } catch (error: any) {
        console.error('Error uploading to storage:', error);
        throw new Error(`Upload failed: ${error.message}`);
    }
} 