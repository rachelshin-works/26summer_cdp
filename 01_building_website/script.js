document.addEventListener('DOMContentLoaded', function() {  
    const button = document.getElementById('demoButton');
    const messageArea = document.getElementById('messageDisplay');
    
    button.addEventListener('click', function() {
        const currentTime = new Date().toLocaleTimeString();
        const message = 'clicked the button at ' + currentTime;
        
        messageArea.textContent = message;
        
        button.textContent = 'success';
        
        setTimeout(function() {
            button.textContent = 'Click Me!';
        }, 2000);
    });
});