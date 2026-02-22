async function main() {
    try {
        const response = await fetch('https://roomxqr.onrender.com/api/menu', {
            headers: { 'x-tenant': 'grandhotel' }
        });
        const data: any = await response.json();
        const items = data.menu || [];
        console.log(`Production API - Total items: ${items.length}`);
        items.forEach((i: any) => {
            const type = (i.image || '').startsWith('data:image') ? 'BASE64' : 'URL';
            console.log(`- ${i.name}: ${type} (${(i.image || '').substring(0, 40)}...)`);
        });
    } catch (err: any) {
        console.error('API Error:', err.message);
    }
}

main();
