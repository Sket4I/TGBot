import { AssemblyAI } from "assemblyai";
import 'dotenv/config'

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLY_API_KEY
});

export const transcriptVoice = async (file) => {
    const audioUrl = file
    
    const params = {
      audio: audioUrl,
      language_code: 'ru'
    }

    const transcript = await client.transcripts.transcribe(params)
    // console.log(transcript)
    return transcript.text ? transcript.text : null
}