const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Update word count as user types
document.getElementById('inputText').addEventListener('input', function(e) {
    const words = e.target.value.trim().split(/\s+/).filter(word => word.length > 0);
    document.getElementById('wordCount').textContent = `${words.length} words`;
});

async function summarizeText() {
    const inputText = document.getElementById('inputText').value.trim();
    const summaryElement = document.getElementById('summary');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const button = document.getElementById('summarizeBtn');

    // Reset UI
    errorElement.style.display = 'none';
    summaryElement.textContent = 'Processing...';

    // Validate input
    if (inputText.length < 100) {
        errorElement.textContent = 'Please enter at least 100 characters.';
        errorElement.style.display = 'block';
        summaryElement.textContent = 'Your summary will appear here...';
        return;
    }

    // Show loading state
    loadingElement.style.display = 'flex';
    button.disabled = true;

    try {
        console.log('Making API request...');
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mixtral-8x7b-32768',
                messages: [
                    {
                        role: 'system',
                        content: `You are a precise and accurate text summarizer. Follow these guidelines:
1. Extract and present only the most important information
2. Maintain factual accuracy - never add information not present in the original text
3. Use clear, concise language
4. Organize information logically
5. Preserve key statistics, numbers, and dates
6. Keep proper nouns and technical terms unchanged
7. Focus on main ideas and supporting key points
8. Remove redundant information
Your summary should be comprehensive yet concise, ensuring no critical information is lost.`
                    },
                    {
                        role: 'user',
                        content: `Analyze and summarize the following text with high precision, maintaining all key facts and figures. Focus on the main points and essential details:\n\n${inputText}`
                    }
                ],
                temperature: 0.3,
                max_tokens: 500,
                top_p: 0.9,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', errorData);
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response format from API');
        }

        const summary = data.choices[0].message.content;
        summaryElement.textContent = summary;

        // Calculate and update statistics
        const inputWords = inputText.split(/\s+/).filter(word => word.length > 0).length;
        const summaryWords = summary.split(/\s+/).filter(word => word.length > 0).length;
        const compressionRate = Math.round((1 - (summaryWords / inputWords)) * 100);

        document.getElementById('compressionRate').textContent = `${compressionRate}%`;
        document.getElementById('summaryWords').textContent = summaryWords;

    } catch (error) {
        console.error('Error details:', error);
        errorElement.textContent = `Error: ${error.message || 'Failed to generate summary. Please try again later.'}`;
        errorElement.style.display = 'block';
        summaryElement.textContent = 'Your summary will appear here...';
    } finally {
        loadingElement.style.display = 'none';
        button.disabled = false;
    }
}
