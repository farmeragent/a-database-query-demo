// Chat Interface
class Chat {
    constructor(messagesContainerId, inputId, sendButtonId, clearButtonId) {
        this.messagesContainer = document.getElementById(messagesContainerId);
        this.input = document.getElementById(inputId);
        this.sendButton = document.getElementById(sendButtonId);
        this.clearButton = document.getElementById(clearButtonId);
        this.isLoading = false;
    }

    initialize() {
        // Send button click
        this.sendButton.addEventListener('click', () => this.handleSend());

        // Enter key in input
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isLoading) {
                this.handleSend();
            }
        });

        // Clear button click
        this.clearButton.addEventListener('click', () => this.clearMessages());
    }

    handleSend() {
        const question = this.input.value.trim();
        if (!question || this.isLoading) return;

        // Trigger send event
        const event = new CustomEvent('sendMessage', { detail: { question } });
        document.dispatchEvent(event);

        // Clear input
        this.input.value = '';
    }

    addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${this.escapeHtml(text)}</p>
            </div>
        `;
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addBotMessage(text, sql = null, metadata = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';

        let content = `<div class="message-content">
            <p>${this.escapeHtml(text)}</p>`;

        if (metadata) {
            content += `<div class="message-meta">${this.escapeHtml(metadata)}</div>`;
        }

        if (sql) {
            content += `<div class="message-sql">${this.escapeHtml(sql)}</div>`;
        }

        content += '</div>';

        messageDiv.innerHTML = content;
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addErrorMessage(error) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.innerHTML = `
            <div class="message-content" style="background: #fee2e2; color: #991b1b;">
                <p><strong>Error:</strong> ${this.escapeHtml(error)}</p>
            </div>
        `;
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showLoading() {
        this.isLoading = true;
        this.sendButton.disabled = true;

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot-message';
        loadingDiv.id = 'loading-message';
        loadingDiv.innerHTML = `
            <div class="message-content loading-message">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
        `;
        this.messagesContainer.appendChild(loadingDiv);
        this.scrollToBottom();
    }

    hideLoading() {
        this.isLoading = false;
        this.sendButton.disabled = false;

        const loadingDiv = document.getElementById('loading-message');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    clearMessages() {
        // Keep only the welcome message
        const messages = Array.from(this.messagesContainer.children);
        messages.slice(1).forEach(msg => msg.remove());

        // Trigger clear event
        const event = new CustomEvent('clearHistory');
        document.dispatchEvent(event);
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
