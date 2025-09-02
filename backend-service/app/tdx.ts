export async function getToken(clientId: string, clientSecret: string): Promise<string> {
    const response = await fetch("https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    });
    const data = await response.json(); 
    return data.access_token;
    
}