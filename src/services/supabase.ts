import supabase from '../config/supabase';

interface GenerationRecord {
    model: string;
    prompt: string;
    systemInstruction: string;
    output: string;
    type: string;
}

export async function recordGeneration(generation: GenerationRecord): Promise<void> {
    try {
        await supabase
            .from('generations')
            .insert(generation);
    } catch (dbError) {
        console.error('Error recording generation:', dbError);
    }
} 