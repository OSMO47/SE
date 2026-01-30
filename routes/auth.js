const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth');

// หน้า Login
router.get('/login', isNotAuthenticated, (req, res) => {
    res.render('auth/login', { error: null });
});
router.get('/logout', isAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/dashboard');
        }
        res.redirect('/login');
    });
});
// การ Login
router.post('/login', isNotAuthenticated, (req, res) => {
    const { username, password } = req.body;
    
    db.query('SELECT * FROM mechanic WHERE user_name = ?', [username], async (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.render('auth/login', { 
                error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
            });
        }
        
        if (results.length === 0) {
            return res.render('auth/login', { 
                error: 'ไม่พบชื่อผู้ใช้นี้'
            });
        }
        
        const match = await bcrypt.compare(password, results[0].password);
        if (!match) {
            return res.render('auth/login', { 
                error: 'รหัสผ่านไม่ถูกต้อง'
            });
        }
        
        req.session.user = {
            id: results[0].id,
            username: results[0].user_name,
            first_name: results[0].first_name,
            email: results[0].email
        };
        
        res.redirect('/dashboard');
    });
});

// หน้า Register
router.get('/register', isNotAuthenticated, (req, res) => {
    res.render('auth/register', { error: null });
});

// การ Register
router.post('/register', isNotAuthenticated, async (req, res) => {
    try {
        const { username, password, first_name, last_name, email } = req.body;
        
        // เช็คว่ามี username หรือ email ซ้ำไหม
        const checkQuery = 'SELECT * FROM mechanic WHERE user_name = ? OR email = ?';
        db.query(checkQuery, [username, email], async (err, results) => {
            if (err) throw err;
            
            if (results.length > 0) {
                return res.render('auth/register', {
                    error: 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว'
                });
            }
            
            // เข้ารหัสรหัสผ่าน
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // เพิ่มข้อมูลลงฐานข้อมูล
            const insertQuery = `
                INSERT INTO mechanic (user_name, password, first_name, last_name, email)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            db.query(insertQuery, [username, hashedPassword, first_name, last_name, email],
                (err, result) => {
                    if (err) throw err;
                    res.redirect('/login');
                }
            );
        });
    } catch (error) {
        console.error('Error:', error);
        res.render('auth/register', {
            error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
        });
    }
});

// Logout - ใช้ POST method ตาม best practice
router.post('/logout', isAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/dashboard');
        }
        res.redirect('/login');
    });
});

module.exports = router;