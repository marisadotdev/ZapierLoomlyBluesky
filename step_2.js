// Zapier Scripting for Loomly (Custom) > BlueSky Posting
// File: step_2.js
// Author: marisa.dev
// GitHub: https://github.com/marisadotdev/ZapierLoomlyBluesky

const url = 'https://bsky.social/xrpc/com.atproto.server.createSession';

const data = {
    identifier: inputData['username'],
    password: inputData['password']
};


const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),  // Sending the data as a JSON string
    headers: {
        'Content-Type': 'application/json' // Use JSON content type
    },
    redirect: 'manual'
});

// Check if the response status is OK
if (!response.ok) {
    console.error('Failed request', await response.text());
    return null;
}

const responseBody = await response.json(); // Parse the JSON response

if (!responseBody.accessJwt) {
    console.error('accessJwt not found in the response');
    return null;
}

output = { accessJwt: responseBody.accessJwt };