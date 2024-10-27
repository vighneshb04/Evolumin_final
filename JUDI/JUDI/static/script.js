async function sendMessage() {
    const userInput = document.getElementById('input').value;
    const messagesDiv = document.getElementById('messages');
  
    // Display user message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.textContent = userInput;
    messagesDiv.appendChild(userMessageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  
    // Clear input field
    document.getElementById('input').value = '';
  
    // Send user message to backend and get bot response
    try {
      const response = await fetch('http://127.0.0.1:5000/chat', { // Updated URL for Flask
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput }),
      });
  
      const data = await response.json();
      const botMessage = data.response;
  
      // Display bot message
      const botMessageDiv = document.createElement('div');
      botMessageDiv.className = 'message bot-message';
      botMessageDiv.textContent = botMessage;
      messagesDiv.appendChild(botMessageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (error) {
      console.error('Error:', error);
    }
}

// Function to toggle chat visibility
function toggleChat() {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.classList.toggle('visible');
}
