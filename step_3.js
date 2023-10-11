// Zapier Scripting for Loomly (Custom) > BlueSky Posting
// File: step_2.js
// Author: marisa.dev
// GitHub: https://github.com/marisadotdev/ZapierLoomlyBluesky

const secondUrl = 'https://bsky.social/xrpc/com.atproto.repo.createRecord';
const authToken = inputData['token'];

const postText = inputData['post_text'];
const postImageURL = inputData['post_image_url'];
const postImageMimeType = inputData['post_image_mime_type'];


const parseFacets = async (text) => {
  const facets = [];

  const parseMentions = (text) => {
	  const spans = [];
	  // regex based on: https://atproto.com/specs/handle#handle-identifier-syntax
	  const mentionRegex = /[$|\W](@([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)/g;
	  const matches = text.matchAll(mentionRegex);
	
	  for (const match of matches) {
	    spans.push({
	      start: match.index + 1,
	      end: match.index + match[0].length,
	      handle: match[1].substring(1),
	    });
	  }
	
	  return spans;
  };

  const parseURLs = (text) => {
		const spans = [];
		// partial/naive URL regex based on: https://stackoverflow.com/a/3809435
		// tweaked to disallow some trailing punctuation
		const urlRegex = /[$|\W](https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*[-a-zA-Z0-9@%_\+~#//=])?)/g;
		const matches = text.matchAll(urlRegex);
		
		for (const match of matches) {
		spans.push({
		  start: match.index + 1,
		  end: match.index + match[0].length,
		  url: match[1],
		});
		}
		
		return spans;
  };

	const resolveHandle = async (handle) => {
	    const url = `https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`;
	    
	    try {
	      const response = await fetch(url);
	      const jsonData = await response.json();
	      return jsonData;
	    } catch (error) {
	      throw error;
	    }
	  };
	
	  for (const m of parseMentions(text)) {
	    try {
	      const response = await resolveHandle(m.handle);
	      const did = response.did;
	
	      facets.push({
	        index: {
	          byteStart: m.start,
	          byteEnd: m.end,
	        },
	        features: [
	          { $type: "app.bsky.richtext.facet#mention", did: did },
	        ],
	      });
	    } catch (error) {
	      if (error.status && error.status === 400) {
	        // If the handle can't be resolved, just skip it!
	        // It will be rendered as text in the post instead of a link
	        continue;
	      } else {
	        console.error(error);
	      }
	    }
	  }
	
	  for (const u of parseURLs(text)) {
	    facets.push({
	      index: {
	        byteStart: u.start,
	        byteEnd: u.end,
	      },
	      features: [
	        {
	          $type: "app.bsky.richtext.facet#link",
	          uri: u.url,
	        },
	      ],
	    });
	  }
	
	  return facets;
};

const imageUrlToBlob = async (imageUrl, altText) => {
  try {
    const responseFetch = await fetch(imageUrl);
    if (!responseFetch.ok) {
      // Handle non-successful response (e.g., image not found)
      console.error('Image not found. Status:', response.status);
      return;
    }
    
    const imgBytes = await responseFetch.buffer();
	if (imgBytes.length > 1000000) {
		console.error('Image file size too large. Maximum 1 megabyte (1000000 bytes), got: ' + imgBytes.length);
	}
	
	// Perform the upload
	const response = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
		method: 'POST',
		headers: {
		  'Content-Type': postImageMimeType,
		  'Authorization': 'Bearer ' + authToken,
		},
		body: imgBytes,
	});
	
	if (!response.ok) {
		console.error('Failed to upload image. Status', response.status);
		return;
	}
	
	const result = await response.json();
	const blob = result.blob;    

    return {
      $type: "app.bsky.embed.images",
      images: [
        {
          alt: altText,
          image: blob,
        },
      ],
    };
  } catch (error) {
    console.error('Error converting image to Blob:', error);
    return;
  }
};

const recordData = {
    "$type": "app.bsky.feed.post",
    "text": postText,
    "createdAt": new Date().toISOString(),
};

const facets = await parseFacets(postText);
if (facets) {
  recordData.facets = facets;
}

const embed = await imageUrlToBlob(postImageURL, postText.slice(0, 50) + '...');
if (embed) {
  recordData.embed = embed;
}

const postData = {
    repo: inputData['username'],
    collection: 'app.bsky.feed.post',
    record: recordData
};

const postResponse = await fetch(secondUrl, {
    method: 'POST',
    body: JSON.stringify(postData),
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }
});

if (!postResponse.ok) {
    console.error('Failed request', await postResponse.text());
    output = {
        success: false,
        message: "Failed to create record"
    };
    return;
}

const postResponseBody = await postResponse.json();
//console.log('Actual JSON response:', postResponseBody);
if (postResponseBody.cid) {
	output = {
        success: true,
        cid: postResponseBody.cid
    };
    return;
}
else {
    console.error('Failed to create record', postResponseBody.message);
    output = {
        success: false,
        message: postResponseBody.message
    };
    return;
}

output = {
    success: false
};