// script.js
const chatDisplay = document.getElementById('chat-display');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const fileInput = document.getElementById('file-upload');
const fileContainer = document.getElementById('file-preview-container');
const fileNameDisplay = document.getElementById('file-name');
const removeFileBtn = document.getElementById('remove-file-btn');
const fileLabel = document.querySelector('label[for="file-upload"]');

// --- Isolate the file label so clicks don't bubble to the input-box ---
fileLabel.addEventListener('click', (e) => e.stopPropagation());

// --- Auto-resize Textarea ---
userInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});

// --- Handle File Attachment UI ---
fileInput.addEventListener('change', (e) => {
    e.stopPropagation();
    const file = fileInput.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB limit. Please choose a smaller file.");
        fileInput.value = '';
        return;
    }

    fileNameDisplay.textContent = file.name;
    fileContainer.classList.remove('hidden');
});

removeFileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileInput.value = '';
    fileContainer.classList.add('hidden');
});

// --- Upload file to /ingest endpoint (PUT) ---
async function ingestFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:8000/ingest/', {
        method: 'PUT',
        body: formData
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ingest failed (${response.status}): ${errorText}`);
    }
    
    // Parse the JSON BEFORE trying to log a message property
    const data = await response.json();
    console.log(`Ingest success: ${data.message || 'File uploaded'}`);

    return data;
}

// --- Handle Sending Message ---
async function sendMessage(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    const text = userInput.value.trim();
    const file = fileInput.files[0];

    if (!text && !file) return;

    // Lock the button for the entire operation
    sendBtn.disabled = true;

    // Snapshot file name before clearing inputs
    const fileName = file ? file.name : null;

    // Build display message
    let displayMsg = text;
    if (file) {
        displayMsg += displayMsg
            ? `\n\n📄 Attached: ${file.name}`
            : `📄 Attached: ${file.name}`;
    }

    // Show user message and clear inputs right away
    appendMessage('user', displayMsg);
    userInput.value = '';
    userInput.style.height = 'auto';
    fileInput.value = '';
    fileContainer.classList.add('hidden');

    const typingId = showTypingIndicator();

    // Wrap network calls in a try/catch/finally to ensure UI recovers
    try {
        // 1. Handle file upload first (if present)
        if (file) {
            const ingestResult = await ingestFile(file);
            console.log(`Ingest success: ${fileName}`);
            
            // If ONLY a file was sent, display the backend's ingest response
            if (!text) {
                appendMessage('ai', ingestResult.message || "File successfully processed.");
            }
        }

        // 2. Handle text message (if present)
        if (text) {    
            const response = await fetch('http://localhost:8000/chat/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) {
                throw new Error(`Server error (${response.status})`);
            }

            const result = await response.json();
            appendMessage('ai', result.response);
        }

    } catch (error) {
        console.error("Messaging Error:", error);
        appendMessage('ai', `❌ An error occurred: ${error.message}`);
    } finally {
        // ALWAYS remove the typing indicator and re-enable the button
        removeTypingIndicator(typingId);
        sendBtn.disabled = false;
        
        // Return focus to input for continuous typing
        userInput.focus(); 
    }
}

// --- UI Helper Functions ---
function appendMessage(role, text) {
    const row = document.createElement('div');
    row.className = `message-row ${role}-row`;

    const avatarIcon = role === 'user'
        ? '<i class="fa-solid fa-user"></i>'
        : '<i class="fa-solid fa-robot"></i>';

    row.innerHTML = `
        <div class="avatar ${role}-avatar">${avatarIcon}</div>
        <div class="message-bubble ${role}-bubble">${text.replace(/\n/g, '<br>')}</div>
    `;

    chatDisplay.appendChild(row);
    scrollToBottom();
}

function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const row = document.createElement('div');
    row.id = id;
    row.className = 'message-row ai-row';
    row.innerHTML = `
        <div class="avatar ai-avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="message-bubble ai-bubble">
            <div class="typing-dots">
                <div class="dot"></div><div class="dot"></div><div class="dot"></div>
            </div>
        </div>
    `;
    chatDisplay.appendChild(row);
    scrollToBottom();
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom() {
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// Enter to send (Shift+Enter for new line)
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(e);
    }
});

// Send button
sendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    sendMessage(e);
});

// --- Fetch and display uploaded files in the sidebar ---


async function fetchFiles() {
  try {
    const response = await fetch("http://localhost:8000/files"); // adjust if prefix used
    const data = await response.json();

    const files = data.files; // 👈 extract correctly

    renderFiles(files);
  } catch (error) {
    console.error("Error fetching files:", error);
  }
}
// Call fetchFiles on page load
window.addEventListener("DOMContentLoaded", fetchFiles);

function renderFiles(files) {
  const fileList = document.getElementById("file-list");
  fileList.innerHTML = "";

  files.forEach(file => {
  const fileItem = document.createElement("div");

  fileItem.innerHTML = `
    <span>${file}</span>
  `;

  fileList.appendChild(fileItem);
});
}