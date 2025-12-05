// const fetch = require('node-fetch');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzJiOWRkZjkzZmM0Mzg2MmI4MGM4OSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzY0OTMyMjI2LCJleHAiOjE3NjUwMTg2MjZ9.zE8ONp4QgquhBh3c0x1_QW_HnXx8MMQ5epJl5MHD1Lo";
const url = "http://localhost:4000/api/cart/getUserCart";

async function test() {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data:", data);
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
