from flask import Flask, request, jsonify,render_template
import google.generativeai as genai

app = Flask(__name__)

# Configure your Gemini API key
genai.configure(api_key="AIzaSyDaZ_htaF4qvqrYY6itgRQaL3HMyxKTZSY")

generation_config = {
    "temperature": 0,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

@app.route('/chat', methods=['POST'])

def chat():
    data = request.json
    user_input = data.get('message')
    response = model.start_chat(history=[]).send_message(user_input)
    bot_response = response.text
    return jsonify({'response': bot_response})

@app.route('/',methods=['GET'])
def home():
    return  render_template('index.html')
if __name__ == "__main__":
    app.run(debug=True)
