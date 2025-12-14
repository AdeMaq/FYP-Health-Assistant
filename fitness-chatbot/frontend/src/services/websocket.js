// frontend/src/services/websocket.js
class WebSocketService {
    constructor() {
        this.socket = null;
        this.messageHandlers = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect(url) {
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.messageHandlers.forEach(handler => handler(data));
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            this.attemptReconnect(url);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected');
        }
    }

    addMessageHandler(handler) {
        this.messageHandlers.push(handler);
    }

    removeMessageHandler(handler) {
        this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }

    attemptReconnect(url) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => this.connect(url), 3000);
        }
    }
}

export default new WebSocketService();