const axios = require('axios');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NmU1OGIwOTUyNWNmNTlkOWY2ZGJlNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NDkyMTEzNywiZXhwIjoxNzY1MDA3NTM3fQ.N1ypzdZ9v8FSTmZaIGwBVa4Sk6jPf10eI2FMGljbLIE';
// const url = 'https://mirosajewelry.com/api/cart';
const url = 'http://localhost:4000/api/cart';

async function test() {
    try {
        console.log('1. Fetching cart...');
        let res = await axios.get(url + '/getUserCart', { headers: { Authorization: `Bearer ${token}` } });
        console.log('Cart items before clear:', res.data.cart.items.length);

        console.log('2. Clearing cart...');
        await axios.post(url + '/clear', {}, { headers: { Authorization: `Bearer ${token}` } });
        console.log('Cart cleared request sent.');

        console.log('3. Fetching cart again...');
        res = await axios.get(url + '/getUserCart', { headers: { Authorization: `Bearer ${token}` } });
        console.log('Cart items after clear:', res.data.cart.items.length);

        if (res.data.cart.items.length === 0) {
            console.log('SUCCESS: Cart is empty.');
        } else {
            console.log('FAILURE: Cart is not empty.');
        }

    } catch (e) {
        console.error('Error:', e.response ? e.response.data : e.message);
    }
}
test();
