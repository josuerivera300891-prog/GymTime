const { getDashboardStats } = require('./src/app/actions/dashboard');

async function test() {
    console.log('Testing getDashboardStats...');
    try {
        const res = await getDashboardStats();
        console.log('Result:', JSON.stringify(res, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
