async function createAdmin() {
    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'password123',
                fullName: 'Admin User'
            })
        });

        if (response.status === 201) {
            console.log('User created: admin / password123');
        } else {
            const data = await response.json();
            console.log('Result:', data);
            console.log('Try credentials: admin / password123');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

createAdmin();
