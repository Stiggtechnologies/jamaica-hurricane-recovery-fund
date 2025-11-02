import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ChatRequest {
  message: string;
  session_id: string;
  context?: any;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { message, session_id, context }: ChatRequest = await req.json();

    if (!message || !session_id) {
      return new Response(
        JSON.stringify({ error: 'Message and session_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await handleChatMessage(supabase, message, session_id, context);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Chatbot error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        response: "I'm sorry, I encountered an error. Please try again or contact us at info@jamaicahurricanefund.org.",
        error: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleChatMessage(
  supabase: any,
  userMessage: string,
  sessionId: string,
  context: any
) {
  const normalizedMessage = userMessage.toLowerCase().trim();

  const { data: knowledgeBase } = await supabase
    .from('chatbot_knowledge')
    .select('*')
    .eq('is_active', true);

  let bestMatch: any = null;
  let bestScore = 0;

  for (const kb of knowledgeBase || []) {
    const score = calculateMatchScore(normalizedMessage, kb);
    if (score > bestScore && score >= (kb.confidence_threshold || 0.5)) {
      bestScore = score;
      bestMatch = kb;
    }
  }

  let botResponse: string;
  let matchedKnowledgeId: string | null = null;
  let confidenceScore = bestScore;
  let usedAi = false;

  if (bestMatch) {
    botResponse = bestMatch.answer;
    matchedKnowledgeId = bestMatch.id;

    await supabase
      .from('chatbot_knowledge')
      .update({
        usage_count: bestMatch.usage_count + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', bestMatch.id);
  } else {
    const openAiKey = Deno.env.get('OPENAI_API_KEY');

    if (openAiKey) {
      try {
        botResponse = await generateAiResponse(userMessage, sessionId, supabase);
        usedAi = true;
        confidenceScore = 0.9;
      } catch (error) {
        console.error('OpenAI API error:', error);
        botResponse = await generateFallbackResponse(normalizedMessage);
      }
    } else {
      botResponse = await generateFallbackResponse(normalizedMessage);
    }
  }

  await supabase.from('chatbot_conversations').insert({
    session_id: sessionId,
    user_message: userMessage,
    bot_response: botResponse,
    matched_knowledge_id: matchedKnowledgeId,
    confidence_score: confidenceScore,
    context: context || {},
  });

  return {
    success: true,
    response: botResponse,
    confidence: confidenceScore,
    matched: bestMatch !== null,
    ai_generated: usedAi,
    suggested_actions: getSuggestedActions(normalizedMessage),
  };
}

async function generateAiResponse(userMessage: string, sessionId: string, supabase: any): Promise<string> {
  const openAiKey = Deno.env.get('OPENAI_API_KEY');

  const { data: conversationHistory } = await supabase
    .from('chatbot_conversations')
    .select('user_message, bot_response')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(5);

  const messages: Message[] = [
    {
      role: 'system',
      content: `You are a helpful assistant for the Jamaica Hurricane Recovery Fund (JHRF). Your role is to:

- Provide information about JHRF's mission to raise $100 million for hurricane relief and recovery in Jamaica
- Explain how donations are used for immediate relief, long-term recovery, and climate-resilient rebuilding
- Share information about volunteer opportunities and ways to get involved
- Answer questions about hurricane recovery efforts in Jamaica
- Direct people to donate at jamaicahurricanefund.org/donate
- Be empathetic, professional, and encouraging
- Keep responses concise and actionable

Key information:
- Founded by Orville Davis, a Jamaican-born entrepreneur based in Alberta, Canada
- Partners include Stigg Security Inc., Omega Group, and Alberta Tech Team
- Focus areas: rebuilding homes, schools, shelters, and community infrastructure
- All donations support transparent, community-led recovery efforts
- Contact: info@jamaicahurricanefund.org

If you don't know something specific, direct them to contact info@jamaicahurricanefund.org or visit the website.`
    }
  ];

  if (conversationHistory && conversationHistory.length > 0) {
    for (const conv of conversationHistory) {
      messages.push({ role: 'user', content: conv.user_message });
      messages.push({ role: 'assistant', content: conv.bot_response });
    }
  }

  messages.push({ role: 'user', content: userMessage });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenAI API error:', errorData);
    throw new Error('Failed to generate AI response');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function calculateMatchScore(message: string, knowledge: any): number {
  let score = 0;

  const questionLower = knowledge.question.toLowerCase();
  if (message.includes(questionLower) || questionLower.includes(message)) {
    score += 0.8;
  }

  if (knowledge.keywords && Array.isArray(knowledge.keywords)) {
    const keywordMatches = knowledge.keywords.filter((keyword: string) =>
      message.includes(keyword.toLowerCase())
    ).length;
    score += (keywordMatches / knowledge.keywords.length) * 0.2;
  }

  const messageWords = message.split(/\s+/);
  const questionWords = questionLower.split(/\s+/);
  const commonWords = messageWords.filter(word =>
    word.length > 3 && questionWords.includes(word)
  ).length;

  if (questionWords.length > 0) {
    score += (commonWords / questionWords.length) * 0.3;
  }

  return Math.min(score, 1.0);
}

function generateFallbackResponse(message: string): string {
  if (message.includes('donate') || message.includes('give') || message.includes('contribute')) {
    return "I'd love to help you make a donation! You can donate directly on our website at jamaicahurricanefund.org/donate. We accept one-time and monthly donations, and all contributions are tax-deductible. Would you like me to explain how your donation will be used?";
  }

  if (message.includes('volunteer') || message.includes('help out')) {
    return "That's wonderful that you want to volunteer! We have opportunities both in Jamaica and remotely. You can apply at jamaicahurricanefund.org/get-involved. We need help with construction, project management, fundraising, communications, and more. What skills would you like to contribute?";
  }

  if (message.includes('contact') || message.includes('email') || message.includes('phone')) {
    return "You can reach us at info@jamaicahurricanefund.org or visit our Contact page for more ways to get in touch. For partnership inquiries, email partnerships@jamaicahurricanefund.org. How else can I help you today?";
  }

  if (message.includes('thank') || message.includes('thanks')) {
    return "You're very welcome! Is there anything else you'd like to know about JHRF or how to support Jamaica's recovery?";
  }

  if (message.length < 10) {
    return "I'm here to help answer questions about JHRF, donations, volunteering, our impact, and hurricane recovery in Jamaica. What would you like to know?";
  }

  return "I'm not sure I understood that question. Here's what I can help with:\n\n" +
    "• Information about JHRF and our mission\n" +
    "• How to donate and where your money goes\n" +
    "• Volunteer opportunities\n" +
    "• Our impact and projects in Jamaica\n" +
    "• Hurricane recovery information\n\n" +
    "You can also email us at info@jamaicahurricanefund.org for detailed assistance. What would you like to know?";
}

function getSuggestedActions(message: string): string[] {
  const actions: string[] = [];

  if (message.includes('donate') || message.includes('give')) {
    actions.push('Make a donation');
    actions.push('Become a monthly donor');
  }

  if (message.includes('volunteer') || message.includes('help')) {
    actions.push('Apply to volunteer');
    actions.push('View current projects');
  }

  if (message.includes('impact') || message.includes('progress')) {
    actions.push('View impact dashboard');
    actions.push('Read success stories');
  }

  if (actions.length === 0) {
    actions.push('Learn about JHRF');
    actions.push('Contact us');
  }

  return actions;
}