let socket = new WebSocket("ws://localhost:8080/chat");

socket.onmessage = function(event) {
    let message = event.data;
    let messageElement = document.createElement('div');
    messageElement.textContent = message;
    document.getElementById('messages').appendChild(messageElement);
};

function sendMessage() {
    let input = document.getElementById('messageInput');
    let message = input.value;
    socket.send(message);
    input.value = '';
}
