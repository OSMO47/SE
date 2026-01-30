function handleLogout() {
    try {
        // ล้าง session storage
        sessionStorage.clear();
        // ล้าง local storage
        localStorage.clear();
        
        // รีไดเร็กต์ไปยังหน้า login
        window.location.href = "http://localhost:3000/login"; // หรือใช้ /login ถ้าทำงานใน URL เดิม
    } catch (error) {
        console.error('Logout error: ' + error);
    }
}
