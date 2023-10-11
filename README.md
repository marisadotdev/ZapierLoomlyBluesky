# Zapier Scripting for Loomly (Custom) > BlueSky Posting
> Author: marisadotdev (https://marisa.dev)

> Github URL: https://github.com/marisadotdev/ZapierLoomlyBluesky

This script takes a custom channel from Loomly and posts it to Bluesky! 
It could almost definitely be adapted to post from another service, like Twitter, to Bluesky as well.
It's also very quickly written, and Node/Javascript is not my strong point, but it works!

## Setup Instructions
- Link your Loomly and Zapier accounts.
- Activate a "Custom Channel" in Loomly.
- Create a new Zap. 
	1. Post Publish Required in Loomly
		- App: Loomly
		- Event: Post Publish Required
		- Trigger (Provider): custom_channel
	2. Code by Zapier
		- Event: Run Javascript
		- Input Data
			- "username" - your Bluesky username
			- "password" - Settings > App Passwords > Add App Password
		- Paste the contents of step_2.js into the contents of the code field.
	3. Code by Zapier
		- Event: Run Javascript
			- Input Data
				- "token" - set to "Access Jwt"
				- "post_text" - set to "Publish Copy"
				- "username" - your Bluesky username
				- "post_image_url" - set to "Publish Photo URL"
				- "post_image_mime_type" - set to "Publish Photo Content Type"
			- Paste the contents of step_3.js into the contents of the code field.
- Run and test all of the code, and then publish the Zap! It will post a test message to Bluesky, so you will have to manually delete it.
- Log into Loomly and create a new post that posts to "Custom Channel".
- Publish the post, and it should post to Bluesky!		


## References
- Code adapted from the [following post by brkld on Zapier's forums](https://community.zapier.com/code-webhooks-52/sending-tweets-to-blue-sky-bsky-app-27950)
- Used the [ATProto documentation](https://atproto.com/blog/create-post) to look up how to post images, links, and tags.
- Used the help of [ChatGPT-3.5](https://chat.openai.com/) to help with converting code from Python to Javascript.