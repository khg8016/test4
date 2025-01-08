import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateResponse(
  message: string,
  characterName: string,
  characterDescription: string
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `당신은 ${characterName}입니다. ${characterDescription} 
          캐릭터의 특성과 역사적 배경을 고려하여 대화하세요. 
          답변은 한국어로 해주세요.`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || '죄송합니다. 응답을 생성할 수 없습니다.';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return '죄송합니다. 일시적인 오류가 발생했습니다.';
  }
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Professional portrait photo of ${prompt}. High quality, realistic, detailed.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    return response.data[0]?.url || '';
  } catch (error) {
    console.error('OpenAI Image Generation Error:', error);
    throw new Error('이미지 생성에 실패했습니다');
  }
}