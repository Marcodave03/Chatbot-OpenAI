import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

const API_KEY = "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";

const systemMessage = {
  role: "system",
  content: "Be a good girlfriend"
};

type InterviewProps = {
  interview_prompt: string | undefined;
}

const App = (props: InterviewProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");

  async function promptInitialization() {
    setIsTyping(true);
    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage,
        { role: "user", content: `Kamu jadi pacar perempuan aku, tanya kabar aku dari ${props.interview_prompt}. Gunakan kata kata yang informal dan ngobrol layaknya manusia. 2-3 kalimat cukup` }
      ]
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => data.json())
      .then((data) => {
        console.log(data);
        setMessages([...messages, {
          message: data.choices[0].message.content,
          sender: "Christy",
          direction: "incoming"
        }]);
        setIsTyping(false);
      });
  }

  useEffect(() => {
    promptInitialization();
  }, []); 

  const handleSend = async () => {
    const newMessage = {
      message: userInput,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);
    setUserInput("");
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages: any) { 
    let apiMessages = chatMessages.map((messageObject: any) => {
      let role = messageObject.sender === "Christy" ? "assistant" : "user";
      return { role, content: messageObject.message };
    });

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage,
        ...apiMessages 
      ]
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => data.json())
      .then((data) => {
        console.log(data);
        setMessages([...chatMessages, {
          message: data.choices[0].message.content,
          sender: "Christy",
          direction: "incoming"
        }]);
        setIsTyping(false);
      });
  }

  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      <div className="chat-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.direction}`}>
            <div className={`bubble ${msg.direction}`}>
              <strong>{msg.sender}:</strong> {msg.message}
            </div>
          </div>
        ))}
        {isTyping && <div className="typing-indicator">Christy is typing...</div>}
        <div className="input-container">
          <input 
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message here..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
          />
          <button onClick={handleSend} disabled={isTyping}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
