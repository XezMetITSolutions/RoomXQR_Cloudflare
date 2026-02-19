import fetch from 'node-fetch'

async function checkApi() {
    const tenantSlug = 'grandhotel'
    const API_BASE_URL = 'https://roomxqr-backend.onrender.com'

    console.log(`Checking API for tenant: ${tenantSlug}...`)

    try {
        const response = await fetch(`${API_BASE_URL}/api/hotel/info`, {
            headers: {
                'x-tenant': tenantSlug
            }
        })

        if (response.ok) {
            const data = await response.json()
            console.log('API Response:', JSON.stringify(data, null, 2))
        } else {
            console.log('API Error:', response.status, await response.text())
        }
    } catch (e) {
        console.error('Fetch error:', e)
    }
}

checkApi()
