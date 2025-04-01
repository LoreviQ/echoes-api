import supabase from '../config/supabase';

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