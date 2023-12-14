
let mode = 'text';

$(function(){
    window.onload = (e) => {
        let sendButton = $('#send-button');
        let messageInput = $('#message-input');
        let switchContainer = $('div.switch');
        let switchButton = switchContainer.find('i');
        
        switchButton.on('click', function(e) {
            e.preventDefault();
            switchButton.removeClass('active');
            $(this).addClass('active');
            mode = $(this).data('mode');
        });

        sendButton.on('click', function(e) {
            e.preventDefault();
            sendMessage(messageInput.val(), 'me');
            messageInput.val('');
        });

        messageInput.on('keypress', function(e) {
            if (e.which === 13) {
                sendMessage(messageInput.val(), 'me');
                messageInput.val('');
            }
        });
    }
});

function sendMessage (message, sender) {
    addMessage(message, sender);
    if (mode == 'text') {
        sendTextMessage(message);
    } else {
        sendImageMessage(message);
    }
}

function sendImageMessage(message) {
    const PAT = 'f5bb3d076e22464186cf586c7addd05a';    
    const USER_ID = 'stability-ai';
    const APP_ID = 'stable-diffusion-2';
    const MODEL_ID = 'stable-diffusion-xl';
    const MODEL_VERSION_ID = '68eeab068a5e4488a685fc67bc7ba71e';
    const RAW_TEXT = message;

    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "text": {
                        "raw": RAW_TEXT
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };

    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
        .then(response => response.json())
        .then(result => {
                const imageBase64 = result.outputs[0].data.image.base64;
                addMessage(imageBase64, 'other', true);
        })      
        .catch(error => console.log('error', error));

}

function sendTextMessage(message) {
    const PAT = 'f5bb3d076e22464186cf586c7addd05a';
    const USER_ID = 'openai';    
    const APP_ID = 'chat-completion';
    const MODEL_ID = 'GPT-3_5-turbo';
    const MODEL_VERSION_ID = '4471f26b3da942dab367fe85bc0f7d21';
    const RAW_TEXT = message;
    
    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "text": {
                        "raw": RAW_TEXT
                    }
                }
            }
        ]
    });
    
    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };
    
    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            if(data.status.code != 10000) {
                console.log(data.status);
            } else {
                console.log(data['outputs'][0]['data']['text']['raw']);
                addMessage(data['outputs'][0]['data']['text']['raw'], 'other');
            }
        }).catch(error => console.log('error', error));
}

function addMessage(message, sender, image = false) {
    let messagesContainer = $('#messages');
    let container = $('.container');
    let date = new Date();
    date = date.getHours() + ':' + date.getMinutes();
    // if message contain ``` then it is code so we need to wrap the debut ``` and the end ``` in pre tag
    if (message.includes('```')) {
        message = message.replace('```', '<pre>');
        message = message.replace('```', '</pre>');
    }
    let messageDiv = `
        <div class="message message-from-${sender}">
            <div class="message-content">
                ${image ? '<img src="data:image/jpeg;base64,' + message + '" />' : '<span>' + message + '</span>'}
            </div>
            <div class="message-footer">
                <span class="message-time">${date}</span>
                ${image ? '' : '<i class="fa-solid fa-ear-listen message-tts"></i>'}
            </div>
        </div>
    `;
    messagesContainer.append(messageDiv);
    if (!image) {
        messagesContainer.find('.message:last-child .message-tts').on('click', function(e) {
            speak(message);
        });
    }
    container.animate({ scrollTop: container.prop('scrollHeight') }, 1000);
}

function speak(message) {
    const PAT = 'f5bb3d076e22464186cf586c7addd05a';
    const USER_ID = 'openai';    
    const APP_ID = 'tts';
    const MODEL_ID = 'openai-tts-1';
    const MODEL_VERSION_ID = 'fff6ce1fd487457da95b79241ac6f02d';    
    const RAW_TEXT = message;

    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "text": {
                        "raw": RAW_TEXT
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };

    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
        .then(response => response.json())
        .then(response => {
            let audio = new Audio('data:audio/wav;base64,' + response['outputs'][0]['data']['audio']['base64']);
            audio.play();
        })
        .catch(error => console.log('error', error));
}




