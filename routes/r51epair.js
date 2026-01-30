const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { isAuthenticated } = require('../middleware/auth');

// ฟังก์ชั่นช่วยคำนวณราคารวม

function calculateTotal(repairId, callback) {
    const query = `
        SELECT 
            (SELECT COALESCE(SUM(ri.price), 0)
             FROM repair_items ri
             WHERE ri.repair_id = ?) as labor_cost,
            (SELECT COALESCE(SUM(rp.quantity * p.price), 0)
             FROM repair_parts rp
             JOIN parts p ON rp.part_id = p.id
             WHERE rp.repair_id = ?) as parts_cost
    `;
    
    db.query(query, [repairId, repairId], (err, results) => {
        if (err) return callback(err);
        
        if (!results || results.length === 0) {
            return callback(null, 0);
        }

        const labor_cost = parseFloat(results[0].labor_cost || 0);
        const parts_cost = parseFloat(results[0].parts_cost || 0);
        const total = labor_cost + parts_cost;
        
        console.log('Calculation details:', {
            repair_id: repairId,
            labor_cost,
            parts_cost,
            total
        });
        
        callback(null, total);
    });
}

// หน้าสร้างงานซ่อม
router.get('/create', isAuthenticated, (req, res) => {
    // ดึงข้อมูล repair types
    db.query('SELECT * FROM repair_types', (err, repairTypes) => {
        if (err) {
            console.error('Error:', err);
            return res.render('error', {
                message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
                user: req.session.user
            });
        }

        // ดึงข้อมูล device types
        db.query('SELECT * FROM device_types', (err, deviceTypes) => {
            if (err) {
                console.error('Error:', err);
                return res.render('error', {
                    message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
                    user: req.session.user
                });
            }

            // ดึงข้อมูลอะไหล่ทั้งหมด
            db.query('SELECT * FROM parts', (err, parts) => {
                if (err) {
                    console.error('Error:', err);
                    return res.render('error', {
                        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
                        user: req.session.user
                    });
                }

                res.render('repair/create', {
                    user: req.session.user,
                    repairTypes,
                    deviceTypes,
                    parts,
                    title: 'สร้างงานซ่อมใหม่'
                });
            });
        });
    });
});

// สร้างงานซ่อมใหม่
router.post('/create', isAuthenticated, (req, res) => {
    console.log('Received data:', req.body);

    const {
        customer_first_name,
        customer_last_name,
        customer_phone,
        repairs
    } = req.body;

    if (!customer_first_name || !customer_last_name || !customer_phone || !repairs) {
        return res.status(400).json({
            success: false,
            message: 'ข้อมูลไม่ครบถ้วน'
        });
    }

    db.beginTransaction(err => {
        if (err) {
            console.log('❌ Transaction error:', err);
            return res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
            });
        }

        // 1. ตรวจสอบลูกค้า
        db.query(
            'SELECT id FROM customer WHERE phone_number = ?',
            [customer_phone],
            (err, customers) => {
                if (err) {
                    console.log('❌ Customer check error:', err);
                    return db.rollback(() => {
                        res.status(500).json({
                            success: false,
                            message: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลลูกค้า'
                        });
                    });
                }

                // ถ้ามีลูกค้าอยู่แล้ว
                if (customers.length > 0) {
                    const customerId = customers[0].id;
                    console.log('✅ Found existing customer:', customerId);
                    db.query(
                        'UPDATE customer SET first_name = ?, last_name = ? WHERE id = ?',
                        [customer_first_name, customer_last_name, customerId],
                        (err) => {
                            if (err) {
                                console.log('❌ Customer update error:', err);
                                return db.rollback(() => {
                                    res.status(500).json({
                                        success: false,
                                        message: 'เกิดข้อผิดพลาดในการอัพเดตข้อมูลลูกค้า'
                                    });
                                });
                            }
                            console.log('✅ Updated customer data');
                            processRepairs(customerId, 0);
                        }
                    );
                } else {
                    // ถ้าไม่มีลูกค้า เพิ่มใหม่
                    db.query(
                        'INSERT INTO customer (first_name, last_name, phone_number) VALUES (?, ?, ?)',
                        [customer_first_name, customer_last_name, customer_phone],
                        (err, result) => {
                            if (err) {
                                console.log('❌ Customer insert error:', err);
                                return db.rollback(() => {
                                    res.status(500).json({
                                        success: false,
                                        message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลลูกค้า'
                                    });
                                });
                            }
                            const customerId = result.insertId;
                            console.log('✅ Created new customer:', customerId);
                            processRepairs(customerId, 0);
                        }
                    );
                }
            }
        );

        const processRepairs = (customerId, index) => {
            if (index >= repairs.length) {
                db.commit(err => {
                    if (err) {
                        console.log('❌ Commit error:', err);
                        return db.rollback(() => {
                            res.status(500).json({
                                success: false,
                                message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
                            });
                        });
                    }
                    console.log('✅ All data saved successfully');
                    res.json({
                        success: true,
                        message: 'บันทึกข้อมูลสำเร็จ'
                    });
                });
                return;
            }

            const repair = repairs[index];
            const repairCode = `R${Date.now()}-${Math.floor(Math.random() * 10000)}`;

            console.log('📝 Processing repair:', repair);
            console.log('👤 Customer ID:', customerId);

            // บันทึกข้อมูลการซ่อม
            db.query(`
                INSERT INTO repair_info 
                (repair_code, customer_id, device_type_id, device_description, status_id)
                VALUES (?, ?, ?, ?, 1)
            `, [repairCode, customerId, repair.device_type_id, repair.device_description], 
            (err, repairResult) => {
                if (err) {
                    console.log('❌ Repair info error:', err);
                    return db.rollback(() => {
                        res.status(500).json({
                            success: false,
                            message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลการซ่อม'
                        });
                    });
                }

                const repairId = repairResult.insertId;
                console.log('✅ Created repair record:', repairId);

                // บันทึกประวัติสถานะ
                db.query(`
                    INSERT INTO status_history 
                    (repair_id, status_id, note)
                    VALUES (?, 1, 'รับงานซ่อมใหม่')
                `, [repairId], (err) => {
                    if (err) {
                        console.log('❌ Status history error:', err);
                        return db.rollback(() => {
                            res.status(500).json({
                                success: false,
                                message: 'เกิดข้อผิดพลาดในการบันทึกประวัติสถานะ'
                            });
                        });
                    }
                    console.log('✅ Created status history');

                    // บันทึกรายการซ่อม
                    let completedRepairTypes = 0;
                    console.log('⚙️ Processing repair types:', repair.repair_types);

                    repair.repair_types.forEach(typeId => {
                        db.query(
                            'INSERT INTO repair_items (repair_id, repair_type_id, price) SELECT ?, ?, estimated_price FROM repair_types WHERE id = ?',
                            [repairId, typeId, typeId],
                            (err) => {
                                if (err) {
                                    console.log('❌ Repair items error:', err);
                                    return db.rollback(() => {
                                        res.status(500).json({
                                            success: false,
                                            message: 'เกิดข้อผิดพลาดในการบันทึกรายการซ่อม'
                                        });
                                    });
                                }
                                completedRepairTypes++;
                                console.log(`✅ Saved repair type ${typeId} (${completedRepairTypes}/${repair.repair_types.length})`);
                                
                                if (completedRepairTypes === repair.repair_types.length) {
                                    // บันทึกข้อมูลอะไหล่
                                    if (repair.parts && repair.parts.length > 0) {
                                        let completedParts = 0;
                                        console.log('🔧 Processing parts:', repair.parts);

                                        repair.parts.forEach((partId, i) => {
                                            db.query(
                                                'INSERT INTO repair_parts (repair_id, part_id, quantity) VALUES (?, ?, ?)',
                                                [repairId, partId, repair.quantities[i]],
                                                (err) => {
                                                    if (err) {
                                                        console.log('❌ Parts error:', err);
                                                        return db.rollback(() => {
                                                            res.status(500).json({
                                                                success: false,
                                                                message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลอะไหล่'
                                                            });
                                                        });
                                                    }
                                                    completedParts++;
                                                    console.log(`✅ Saved part ${partId} (${completedParts}/${repair.parts.length})`);
                                                    
                                                    if (completedParts === repair.parts.length) {
                                                        processRepairs(customerId, index + 1);
                                                    }
                                                }
                                            );
                                        });
                                    } else {
                                        console.log('ℹ️ No parts to save');
                                        processRepairs(customerId, index + 1);
                                    }
                                }
                            }
                        );
                    });
                });
            });
        };
    });
});


// หน้ารายการซ่อม
router.get('/list', isAuthenticated, (req, res) => {
    const query = `
        SELECT 
            ri.id,
            ri.repair_code,
            dt.name as device_type,
            ri.device_description,
            ri.created_at,
            rs.status_name,
            rs.id as status_id,
            c.first_name,
            c.last_name,
            c.phone_number,
            m.first_name as mechanic_name,
            CASE 
                WHEN EXISTS (
                    SELECT 1 
                    FROM payments p 
                    WHERE p.repair_id = ri.id 
                    AND p.payment_status = 'completed'
                ) THEN true 
                ELSE false 
            END as is_paid
        FROM repair_info ri
        JOIN repair_status rs ON ri.status_id = rs.id
        JOIN customer c ON ri.customer_id = c.id
        JOIN device_types dt ON ri.device_type_id = dt.id
        LEFT JOIN mechanic m ON ri.mechanic_id = m.id
        ORDER BY ri.created_at DESC
    `;

    db.query(query, (err, repairs) => {
        if (err) {
            console.error('Error:', err);
            return res.render('error', {
                message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
                user: req.session.user
            });
        }

        res.render('repair/list', {
            user: req.session.user,
            repairs: repairs
        });
    });
});
// ดึงยอดเงินรวม
router.get('/get-total/:repairId', isAuthenticated, (req, res) => {
    calculateTotal(req.params.repairId, (err, total) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
            });
        }
        res.json({ success: true, total });
    });
});

// ดูรายละเอียดงานซ่อม
router.get('/detail/:repair_code', isAuthenticated, (req, res) => {
    const repair_code = req.params.repair_code;
    
    // Query ข้อมูลงานซ่อม
    const repairQuery = `
        SELECT r.*, 
            c.first_name as customer_first_name, 
            c.last_name as customer_last_name,
            c.phone_number,
            m.first_name as mechanic_name, 
            m.last_name as mechanic_last_name,
            s.status_name,
            dt.name as device_type
        FROM repair_info r
        LEFT JOIN customer c ON r.customer_id = c.id
        LEFT JOIN mechanic m ON r.mechanic_id = m.id
        LEFT JOIN repair_status s ON r.status_id = s.id
        LEFT JOIN device_types dt ON r.device_type_id = dt.id
        WHERE r.repair_code = ?
    `;
 
    // Query ประวัติสถานะ
    const historyQuery = `
        SELECT sh.*, s.status_name, m.first_name, m.last_name
        FROM status_history sh
        LEFT JOIN repair_status s ON sh.status_id = s.id
        LEFT JOIN mechanic m ON sh.mechanic_id = m.id
        WHERE sh.repair_id = (SELECT id FROM repair_info WHERE repair_code = ?)
        ORDER BY sh.created_at DESC
    `;
 
    // Query รายการซ่อม
    const repairItemsQuery = `
        SELECT ri.*, rt.name as repair_type_name, ri.price
        FROM repair_items ri
        LEFT JOIN repair_types rt ON ri.repair_type_id = rt.id
        WHERE ri.repair_id = (SELECT id FROM repair_info WHERE repair_code = ?)
    `;
 
    // Query การชำระเงิน
    const paymentQuery = `
        SELECT p.*, pm.method_name,
            m.first_name as mechanic_name,
            m.last_name as mechanic_last_name
        FROM payments p
        JOIN payment_methods pm ON p.payment_method_id = pm.id
        JOIN mechanic m ON p.mechanic_id = m.id
        WHERE p.repair_id = (SELECT id FROM repair_info WHERE repair_code = ?)
        ORDER BY p.created_at DESC LIMIT 1
    `;
 
    // Query รายการอะไหล่
    const partsQuery = `
        SELECT rp.quantity, p.*
        FROM repair_parts rp
        JOIN parts p ON rp.part_id = p.id
        WHERE rp.repair_id = (SELECT id FROM repair_info WHERE repair_code = ?)
    `;
 
    // ทำการ query ข้อมูลทั้งหมด
    db.query(repairQuery, [repair_code], (err, repairs) => {
        if (err) {
            console.error('Error:', err);
            return res.render('error', {
                message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
                user: req.session.user
            });
        }
 
        if (!repairs[0]) {
            return res.render('error', {
                message: 'ไม่พบข้อมูลงานซ่อม',
                user: req.session.user
            });
        }
 
        const repair = repairs[0];
 
        // ดึงประวัติสถานะ
        db.query(historyQuery, [repair_code], (err, history) => {
            if (err) {
                console.error('Error:', err);
                history = [];
            }
 
            // ดึงรายการซ่อม
            db.query(repairItemsQuery, [repair_code], (err, repair_items) => {
                if (err) {
                    console.error('Error:', err);
                    repair_items = [];
                }
 
                // ดึงข้อมูลการชำระเงิน
                db.query(paymentQuery, [repair_code], (err, payments) => {
                    if (err) {
                        console.error('Error:', err);
                        payments = [];
                    }
 
                    // ดึงรายการอะไหล่
                    db.query(partsQuery, [repair_code], (err, parts) => {
                        if (err) {
                            console.error('Error:', err);
                            parts = [];
                        }
 
                        res.render('repair/detail', {
                            repair,
                            history,
                            repair_items,
                            parts,
                            payment: payments[0] || null, 
                            user: req.session.user
                        });
                    });
                });
            });
        });
    });
 });

// อัพเดตสถานะงานซ่อม
router.post('/update-status', isAuthenticated, (req, res) => {
    const { repair_id, status_id, notes } = req.body;
    const mechanic_id = req.session.user.id;

    db.beginTransaction(err => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
            });
        }

        // อัพเดตสถานะ
        const updateQuery = `
            UPDATE repair_info 
            SET status_id = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        db.query(updateQuery, [status_id, repair_id], (err) => {
            if (err) {
                return db.rollback(() => {
                    res.status(500).json({
                        success: false,
                        message: 'เกิดข้อผิดพลาดในการอัพเดตสถานะ'
                    });
                });
            }

            // บันทึกประวัติ
            const historyQuery = `
                INSERT INTO status_history (repair_id, status_id, mechanic_id, note)
                VALUES (?, ?, ?, ?)
            `;

            db.query(historyQuery, [repair_id, status_id, mechanic_id, notes], (err) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({
                            success: false,
                            message: 'เกิดข้อผิดพลาดในการบันทึกประวัติ'
                        });
                    });
                }

                db.commit(err => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({
                                success: false,
                                message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
                            });
                        });
                    }

                    res.json({
                        success: true,
                        message: 'อัพเดตสถานะสำเร็จ'
                    });
                });
            });
        });
    });
});

// รับงานซ่อม
router.post('/accept', isAuthenticated, (req, res) => {
    const { repairId } = req.body;
    const mechanicId = req.session.user.id;

    db.beginTransaction(err => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
            });
        }

        // อัพเดตสถานะและช่างซ่อม
        const updateQuery = `
            UPDATE repair_info 
            SET status_id = 2, 
                mechanic_id = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND status_id = 1
        `;

        db.query(updateQuery, [mechanicId, repairId], (err, result) => {
            if (err || result.affectedRows === 0) {
                return db.rollback(() => {
                    res.status(500).json({
                        success: false,
                        message: 'ไม่สามารถรับงานได้หรือมีผู้อื่นรับงานนี้แล้ว'
                    });
                });
            }

            // บันทึกประวัติสถานะ
            const historyQuery = `
                INSERT INTO status_history (repair_id, status_id, mechanic_id, note)
                VALUES (?, 2, ?, 'รับงานเรียบร้อย')
            `;

            db.query(historyQuery, [repairId, mechanicId], (err) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({
                            success: false,
                            message: 'เกิดข้อผิดพลาดในการบันทึกประวัติ'
                        });
                    });
                }

                db.commit(err => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({
                                success: false,
                                message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
                            });
                        });
                    }

                    res.json({
                        success: true,
                        message: 'รับงานเรียบร้อย'
                    });
                });
            });
        });
    });
});

// บันทึกการชำระเงิน
router.post('/payment', isAuthenticated, (req, res) => {
    const { repair_id, payment_method_id, reference_no } = req.body;
    const mechanic_id = req.session.user.id;

    calculateTotal(repair_id, (err, total) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการคำนวณยอดเงิน'
            });
        }

        db.beginTransaction(err => {
            if (err) {
                console.error('Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
                });
            }

            // บันทึกข้อมูลการชำระเงิน
            const paymentQuery = `
                INSERT INTO payments (
                    repair_id, amount, payment_method_id, payment_status,
                    reference_no, mechanic_id, payment_date
                ) VALUES (?, ?, ?, 'completed', ?, ?, CURRENT_TIMESTAMP)
            `;

            db.query(paymentQuery, [repair_id, total, payment_method_id, reference_no, mechanic_id], (err) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({
                            success: false,
                            message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลการชำระเงิน'
                        });
                    });
                }

                // อัพเดตสถานะงานซ่อม
                const updateQuery = `
                    UPDATE repair_info 
                    SET status_id = 5,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `;

                db.query(updateQuery, [repair_id], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({
                                success: false,
                                message: 'เกิดข้อผิดพลาดในการอัพเดตสถานะ'
                            });
                        });
                    }

                    // บันทึกประวัติการเปลี่ยนสถานะ
                    const historyQuery = `
                        INSERT INTO status_history (
                            repair_id, status_id, mechanic_id, note
                        ) VALUES (?, 5, ?, 'ชำระเงินและส่งมอบเรียบร้อย')
                    `;

                    db.query(historyQuery, [repair_id, mechanic_id], (err) => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).json({
                                    success: false,
                                    message: 'เกิดข้อผิดพลาดในการบันทึกประวัติ'
                                });
                            });
                        }

                        db.commit(err => {
                            if (err) {
                                return db.rollback(() => {
                                    res.status(500).json({
                                        success: false,
                                        message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
                                    });
                                });
                            }

                            res.json({
                                success: true,
                                message: 'บันทึกการชำระเงินสำเร็จ'
                            });
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;