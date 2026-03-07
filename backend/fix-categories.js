const db = require('./config/db');

async function fixCategories() {
    try {
        console.log('Fixing duplicate categories...');

        // 1. Find the target "Dessert" (singular) category
        const [targetCats] = await db.promise().query("SELECT id FROM categories WHERE name = 'Dessert'");
        if (!targetCats.length) {
            // If only 'Desserts' exists, rename it.
            console.log("'Dessert' not found. Checking for 'Desserts'...");
            const [pluralCats] = await db.promise().query("SELECT id FROM categories WHERE name = 'Desserts'");
            if (pluralCats.length) {
                console.log("Renaming 'Desserts' to 'Dessert'...");
                await db.promise().query("UPDATE categories SET name = 'Dessert' WHERE id = ?", [pluralCats[0].id]);
                console.log("Done.");
                process.exit(0);
            }
            console.error("No dessert category found.");
            process.exit(1);
        }
        const targetId = targetCats[0].id;
        console.log(`Target Category: 'Dessert' (ID: ${targetId})`);

        // 2. Find "Desserts" (plural)
        const [oldCats] = await db.promise().query("SELECT id FROM categories WHERE name = 'Desserts'");
        if (oldCats.length) {
            const oldId = oldCats[0].id;
            console.log(`Found duplicate: 'Desserts' (ID: ${oldId})`);

            // 3. Move products
            const [updateResult] = await db.promise().query("UPDATE products SET category_id = ? WHERE category_id = ?", [targetId, oldId]);
            console.log(`Moved ${updateResult.changedRows} products from ID ${oldId} to ${targetId}.`);

            // 4. Delete old category
            await db.promise().query("DELETE FROM categories WHERE id = ?", [oldId]);
            console.log(`Deleted 'Desserts' (ID: ${oldId}).`);
        } else {
            console.log("No duplicate 'Desserts' category found.");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixCategories();
