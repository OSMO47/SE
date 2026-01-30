const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, (req, res) => {
    // ดึงข้อมูลสถิติงานซ่อม
    const statsQuery = `
        SELECT 
            COUNT(CASE WHEN status_id = 1 THEN 1 END) as pending_repairs,
            COUNT(CASE WHEN status_id = 2 THEN 1 END) as ongoing_repairs,
            COUNT(CASE WHEN status_id = 4 THEN 1 END) as completed_repairs,
            COUNT(*) as total_repairs
        FROM repair_info
    `;

    // ดึงข้อมูลงานซ่อมล่าสุด
    const recentRepairsQuery = `
        SELECT 
            ri.repair_code,
            CONCAT(c.first_name, ' ', c.last_name) as customer_name,
            dt.name as device_type,
            rs.status_name,
            CASE 
                WHEN ri.status_id = 1 THEN 'pending'
                WHEN ri.status_id = 2 THEN 'progress'
                WHEN ri.status_id = 4 THEN 'completed'
                ELSE 'default'
            END as status_class,
            ri.created_at
        FROM repair_info ri
        JOIN customer c ON ri.customer_id = c.id
        JOIN repair_status rs ON ri.status_id = rs.id
        JOIN device_types dt ON ri.device_type_id = dt.id
        ORDER BY ri.created_at DESC
        LIMIT 5
    `;

    // ดึงข้อมูลอะไหล่ที่ใกล้หมด
    const lowStockQuery = `
        SELECT 
            p.name, 
            p.stock_quantity,
            GROUP_CONCAT(dt.name) as device_types
        FROM parts p
        LEFT JOIN parts_device_types pdt ON p.id = pdt.part_id
        LEFT JOIN device_types dt ON pdt.device_type_id = dt.id
        WHERE p.stock_quantity <= p.min_quantity
        GROUP BY p.id
        LIMIT 5
    `;

    // ทำ queries พร้อมกัน
    Promise.all([
        new Promise((resolve, reject) => {
            db.query(statsQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(recentRepairsQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(lowStockQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        })
    ])
    .then(([statsResults, repairResults, stockResults]) => {
        res.render('dashboard/index', {
            user: req.session.user,
            summary: statsResults[0],
            recent_repairs: repairResults,
            low_stock_parts: stockResults.map(part => ({
                ...part,
                device_types: part.device_types ? part.device_types.split(',') : []
            }))
        });
    })
    .catch(err => {
        console.error('Error loading dashboard:', err);
        res.status(500).send('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    });
});

// API endpoint สำหรับดึงข้อมูลงานซ่อมล่าสุด
router.get('/recent-repairs', isAuthenticated, (req, res) => {
    const query = `
        SELECT 
            ri.repair_code,
            CONCAT(c.first_name, ' ', c.last_name) as customer_name,
            dt.name as device_type,
            rs.status_name,
            CASE 
                WHEN ri.status_id = 1 THEN 'pending'
                WHEN ri.status_id = 2 THEN 'progress'
                WHEN ri.status_id = 4 THEN 'completed'
                ELSE 'default'
            END as status_class,
            ri.created_at
        FROM repair_info ri
        JOIN customer c ON ri.customer_id = c.id
        JOIN repair_status rs ON ri.status_id = rs.id
        JOIN device_types dt ON ri.device_type_id = dt.id
        ORDER BY ri.created_at DESC
        LIMIT 5
    `;

    db.query(query, (err, repairs) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
            });
        }
        res.json(repairs);
    });
});

// API endpoint สำหรับดึงข้อมูลสรุป
router.get('/summary', isAuthenticated, (req, res) => {
    const query = `
        SELECT 
            COUNT(CASE WHEN status_id = 1 THEN 1 END) as pending_repairs,
            COUNT(CASE WHEN status_id = 2 THEN 1 END) as ongoing_repairs,
            COUNT(CASE WHEN status_id = 4 THEN 1 END) as completed_repairs,
            COUNT(*) as total_repairs
        FROM repair_info
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
            });
        }
        res.json(results[0]);
    });
});

// API endpoint สำหรับดึงข้อมูลอะไหล่ที่ใกล้หมด
router.get('/low-stock', isAuthenticated, (req, res) => {
    const query = `
        SELECT 
            p.name, 
            p.stock_quantity,
            GROUP_CONCAT(dt.name) as device_types
        FROM parts p
        LEFT JOIN parts_device_types pdt ON p.id = pdt.part_id
        LEFT JOIN device_types dt ON pdt.device_type_id = dt.id
        WHERE p.stock_quantity <= p.min_quantity
        GROUP BY p.id
        LIMIT 5
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
            });
        }
        res.json(results);
    });
});

module.exports = router;