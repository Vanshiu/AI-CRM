import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client (fails gracefully if API key is not present)
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('WARNING: GEMINI_API_KEY environment variable is missing. Backend will operate in fallback mode.');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// Contextual template repository for high-quality fallback replies
const FALLBACK_TEMPLATES = {
  pricing: [
    "Hi there! We offer flexible subscription plans tailored to businesses of all sizes, starting from our basic tier. I'd love to schedule a quick chat to discuss which plan fits your requirements best. What does your schedule look like this week?",
    "Hello! Thanks for asking about our pricing. We have several tiers designed to scale with your team's growth. I can send over our detailed pricing matrix, or we can jump on a brief call to find the best fit. Let me know what works for you!",
    "Hi! We have a range of plan options starting from our starter tier up to custom enterprise packages. I'd be happy to guide you through them to ensure you get the best value. Would you be free for a 5-minute call tomorrow?"
  ],
  demo: [
    "Hello! We would be delighted to host a personalized live demo for you and your team. We can walk through all the core modules and answer any questions. You can book a time slot directly using our calendar link, or let me know your availability!",
    "Hi there! Seeing the platform in action is the best way to understand its power. I'd love to set up a 15-minute walkthrough demo for you this week. Would Wednesday or Thursday afternoon work better for you?",
    "Greetings! I can set up a personalized demo to show you how our tool can optimize your workflow. Please let me know a few times that work for you, or feel free to use our online scheduling link to pick a slot."
  ],
  delivery: [
    "Hello! Our team usually processes and ships all enterprise packages within 2–3 business days, with full tracking details sent to your email. Please let me know your order number or reference ID, and I will check the delivery status for you right away.",
    "Hi! Standard deliveries take about 3-5 business days depending on your region, and we expedite priority packages. If you can provide your email or tracking number, I can check the exact status of your package immediately.",
    "Hello! Thank you for reaching out. I'd be happy to track your delivery. Could you please reply with your order confirmation number? I will inspect the logistics queue and update you shortly."
  ],
  refund: [
    "Hi there. We want to ensure you have a great experience with us. Our standard policy offers a 14-day refund window. Could you please share the details of your account or purchase so I can check your eligibility and assist you with the next steps?",
    "Hello. I understand you're inquiring about a refund. We have a clear return policy within 30 days of purchase. Please share your invoice number or receipt details, and our billing support team will look into this for you right away.",
    "Hi! I can certainly help look into your refund inquiry. To get started, could you share the email address associated with the transaction? I will retrieve the invoice and guide you through the process."
  ],
  availability: [
    "Hello! Thank you for your interest. The product is currently in stock and ready to be deployed for your account. I can assist you with setting up your instance today—would you like me to send over the onboarding steps?",
    "Hi! Yes, this item is available and ready for onboarding. We can activate your licensing tier immediately. Would you like to proceed with the activation details, or is there another specification I can check for you first?",
    "Hello! We have active stock and can deploy this module to your system right away. I'd be happy to help coordinate this launch for you. Let me know if you would like to move forward today."
  ],
  features: [
    "Hi! Our platform comes equipped with robust contact pipelines, automated email flows, and real-time dashboard analytics. We also support developer API integrations. What specific feature capability are you most interested in exploring?",
    "Hello! We support automated pipeline tracking, contact notes, Kanban status boards, and dynamic metrics. I can send you a feature sheet or we can discuss your target features in a short call. What is your team's main priority?",
    "Hi! Our platform provides a comprehensive suite of pipeline tools, user dashboards, and custom integrations. I'd love to share some insights on how our specific features solve your sales bottlenecks. When are you free for a brief chat?"
  ],
  generic: [
    "Hi! Thank you for reaching out. We have received your inquiry and our team is looking into it to provide the best possible solution. We will follow up with more detailed information shortly. Please let us know if you have any other questions!",
    "Hello! Thanks for your message. I want to make sure I give you the most accurate information. Let me check this with our support specialist and get back to you within the hour. Is there anything else I can add to the query?",
    "Hi! I appreciate your message. I am reviewing your query with our accounts team right now to ensure a thorough response. I will follow up with you very shortly with detailed coordinates."
  ]
};

// Keyword classification engine
const classifyIntent = (message) => {
  const msg = message.toLowerCase();

  if (msg.includes('price') || msg.includes('pricing') || msg.includes('cost') || msg.includes('subscription') || msg.includes('plan') || msg.includes('bill')) {
    return 'pricing';
  }
  if (msg.includes('demo') || msg.includes('trial') || msg.includes('walkthrough') || msg.includes('showcase')) {
    return 'demo';
  }
  if (msg.includes('deliver') || msg.includes('ship') || msg.includes('transit') || msg.includes('track') || msg.includes('logistics')) {
    return 'delivery';
  }
  if (msg.includes('refund') || msg.includes('return') || msg.includes('cashback') || msg.includes('money back')) {
    return 'refund';
  }
  if (msg.includes('available') || msg.includes('stock') || msg.includes('buy') || msg.includes('purchase')) {
    return 'availability';
  }
  if (msg.includes('feature') || msg.includes('integration') || msg.includes('api') || msg.includes('capability') || msg.includes('what can')) {
    return 'features';
  }
  return 'generic';
};

/**
 * Generate AI reply suggestion
 * POST /api/ai/reply
 */
export const generateReply = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid customer message.'
      });
    }

    const trimmedMessage = message.trim();
    const intent = classifyIntent(trimmedMessage);

    // Pick a template randomly from templates database for this intent
    const templates = FALLBACK_TEMPLATES[intent] || FALLBACK_TEMPLATES.generic;
    const randomIndex = Math.floor(Math.random() * templates.length);
    const fallbackReply = templates[randomIndex];

    const genAI = getGeminiClient();

    if (!genAI) {
      // Graceful fallback mode if API key is missing
      return res.status(200).json({
        success: true,
        data: {
          reply: fallbackReply,
          source: 'fallback_model'
        }
      });
    }

    // Call Gemini API inside a try/catch block to absorb any API-side errors (rate limits, key invalidations)
    try {
      // Use gemini-1.5-flash which is fast, lightweight, and robust
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
You are a professional, helpful, and sales-focused customer relations representative for a modern B2B SaaS startup.
Analyze the customer's message below and generate a friendly, natural, conversational, and human-like reply suggestion.

Prompt Instructions:
1. The reply must sound like a real person writing a warm business message. Avoid robotic transitions or formal formulas.
2. Keep it concise: maximum 2 to 3 short sentences.
3. Maintain a helpful, sales-oriented tone (e.g., offer a call, ask a guiding question, or propose next steps).
4. Do NOT use markdown formatting, bold text (*), italic text, lists, or bullets. Return plain text only.
5. Do NOT include email signatures, placeholders, brackets like [Your Name], or greeting titles like "Dear Customer". Start directly with "Hi!" or "Hello!" and a natural greeting.

Customer Message:
"${trimmedMessage}"

Professional AI Reply Suggestion:
`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.75, // Temperature set to allow natural phrasing variations
          maxOutputTokens: 150
        }
      });

      const responseText = result.response?.text();

      if (responseText && responseText.trim()) {
        return res.status(200).json({
          success: true,
          data: {
            reply: responseText.trim().replace(/\*+/g, ''), // Strip any unintended bold markdown tags
            source: 'gemini_api'
          }
        });
      } else {
        throw new Error('Gemini API returned an empty or invalid response.');
      }

    } catch (apiError) {
      console.error('Gemini API Error - Redirecting to Fallback Engine:', apiError.message);
      
      // Return high-quality fallback template
      return res.status(200).json({
        success: true,
        data: {
          reply: fallbackReply,
          source: 'fallback_model',
          warning: 'Gemini request failed. Reverted to local fallback model.'
        }
      });
    }

  } catch (error) {
    console.error('Core AI Reply Controller Failure:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while processing reply request.'
    });
  }
};
