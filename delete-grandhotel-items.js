// Script to delete ALL menu items from the grandhotel tenant
// Run this with: node delete-grandhotel-items.js

const API_URL = 'https://roomxqr-backend.onrender.com';
const TENANT = 'grandhotel';

async function deleteAllMenuItems() {
    try {
        console.log(`Fetching menu items for ${TENANT}...`);
        const response = await fetch(`${API_URL}/api/menu`, {
            headers: {
                'x-tenant': TENANT
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch menu: ${response.statusText}`);
        }

        const data = await response.json();
        const menuItems = data.menuItems || data.menu || [];

        console.log(`Found ${menuItems.length} menu items in ${TENANT}.`);

        if (menuItems.length === 0) {
            console.log('No items to delete.');
            return;
        }

        console.log('Starting deletion process...');

        // Delete each item
        for (const item of menuItems) {
            console.log(`Deleting ${item.name} (ID: ${item.id})...`);
            const deleteResponse = await fetch(`${API_URL}/api/menu/${item.id}`, {
                method: 'DELETE',
                headers: {
                    'x-tenant': TENANT,
                    'Content-Type': 'application/json'
                }
            });

            if (deleteResponse.ok) {
                console.log(`✓ Deleted ${item.name}`);
            } else {
                console.error(`✗ Failed to delete ${item.name} (ID: ${item.id}): ${deleteResponse.status} ${deleteResponse.statusText}`);
            }

            // Adding a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        console.log('\nDeletion complete!');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

deleteAllMenuItems();
