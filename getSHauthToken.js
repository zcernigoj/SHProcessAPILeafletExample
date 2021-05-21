const CLIENT_ID = "<your-client-id-here>";
const CLIENT_SECRET = "<your-client-secret-here>";

async function getAuthToken() {
	const clientId = encodeURIComponent(CLIENT_ID);
	const clientSecret = encodeURIComponent(CLIENT_SECRET);

	const response = await fetch(
		"https://services.sentinel-hub.com/oauth/token",
		{
			method: "post",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: 'grant_type=client_credentials&client_id=' + clientId + '&client_secret=' + clientSecret,
		}
	);

	const body = await response.json();
	return body["access_token"];
}
