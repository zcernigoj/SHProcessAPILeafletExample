const CLIENT_ID = "37919fc2-b629-46e4-9e24-348f3b1ebf9b";
const CLIENT_SECRET = "hHm[abz^gy^m>YRIezy9.NUO7%b#?!C^xLCF{YG5";

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
