const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { isAuthenticated } = require("../middleware/auth");

// Utility function สำหรับ query แบบ Promise
function queryAsync(sql, values) {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

// แสดงรายการอะไหล่
router.get("/inventory", isAuthenticated, async (req, res) => {
  try {
    // Query สำหรับดึงข้อมูลอะไหล่พร้อมประเภทอุปกรณ์
    const parts = await queryAsync(`
            SELECT 
                p.*,
                GROUP_CONCAT(DISTINCT dt.id) as device_type_ids,
                GROUP_CONCAT(DISTINCT dt.name) as device_type_names
            FROM parts p
            LEFT JOIN parts_device_types pdt ON p.id = pdt.part_id
            LEFT JOIN device_types dt ON pdt.device_type_id = dt.id
            GROUP BY p.id
            ORDER BY p.name
        `);

    // Query สำหรับดึงข้อมูลประเภทอุปกรณ์
    const deviceTypes = await queryAsync(
      "SELECT * FROM device_types ORDER BY name"
    );

    res.render("parts/inventory", {
      user: req.session.user,
      parts: parts.map((part) => ({
        ...part,
        device_types: part.device_type_ids
          ? part.device_type_ids.split(",").map(Number)
          : [],
        device_type_names: part.device_type_names
          ? part.device_type_names.split(",")
          : [],
      })),
      deviceTypes,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("เกิดข้อผิดพลาดในการดึงข้อมูล");
  }
});

// เพิ่มอะไหล่ใหม่
router.post("/add", isAuthenticated, async (req, res) => {
    const { name, description, price, stock_quantity, min_quantity } = req.body;

    // แก้ไขส่วนการรับค่า device_types
    const device_types = Array.isArray(req.body.device_types)
        ? req.body.device_types
        : req.body.device_types
            ? [req.body.device_types]
            : [];

    const mechanic_id = req.session.user.id;

    try {
        await db.beginTransaction();

        // เพิ่มอะไหล่
        const insertResult = await queryAsync(
            `
            INSERT INTO parts (name, description, price, stock_quantity, min_quantity)
            VALUES (?, ?, ?, ?, ?)
            `,
            [name, description, price, stock_quantity || 0, min_quantity || 0]
        );

        // ตรวจสอบว่ามี insertId หรือไม่
        if (!insertResult || !insertResult.insertId) {
            throw new Error('ไม่สามารถเพิ่มข้อมูลอะไหล่ได้');
        }

        const partId = insertResult.insertId;

        // เพิ่มความสัมพันธ์กับประเภทอุปกรณ์
        if (device_types && device_types.length > 0) {
            for (const dt_id of device_types) {
                if (!dt_id) continue; // ข้าม device_type_id ที่เป็น null หรือ undefined

                await queryAsync(
                    `
                    INSERT INTO parts_device_types (part_id, device_type_id)
                    VALUES (?, ?)
                    `,
                    [partId, Number(dt_id)]
                );
            }
        }

        // บันทึกประวัติถ้ามีการรับเข้าครั้งแรก
        if (stock_quantity > 0) {
            await queryAsync(
                `
                INSERT INTO parts_history (
                    part_id, transaction_type, quantity, mechanic_id, notes
                ) VALUES (?, ?, ?, ?, ?)
                `,
                [partId, "รับ", stock_quantity, mechanic_id, "รับเข้าครั้งแรก"]
            );
        }

        await db.commit();
        res.json({
            success: true,
            message: "เพิ่มอะไหล่สำเร็จ",
            partId: partId,
        });
    } catch (err) {
        await db.rollback();
        console.error("Error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        });
    }
});

// แก้ไขอะไหล่
router.post("/edit", isAuthenticated, async (req, res) => {
  const { part_id, name, description, price, min_quantity } = req.body;

  // แก้ไขส่วนการรับค่า device_types
  const device_types = Array.isArray(req.body.device_types)
    ? req.body.device_types
    : req.body.device_types
    ? [req.body.device_types]
    : [];

  try {
    await db.beginTransaction();

    // อัพเดทข้อมูลอะไหล่
    await queryAsync(
      `
            UPDATE parts 
            SET 
                name = ?,
                description = ?,
                price = ?,
                min_quantity = ?
            WHERE id = ?
        `,
      [name, description, price, min_quantity, part_id]
    );

    // ลบความสัมพันธ์เก่า
    await queryAsync("DELETE FROM parts_device_types WHERE part_id = ?", [
      part_id,
    ]);

    // เพิ่มความสัมพันธ์ใหม่
    if (device_types && device_types.length > 0) {
      // สร้าง query แบบ individual inserts แทน
      for (const dt_id of device_types) {
        await queryAsync(
          `
                    INSERT INTO parts_device_types (part_id, device_type_id)
                    VALUES (?, ?)
                `,
          [part_id, Number(dt_id)]
        );
      }
    }

    await db.commit();
    res.json({ success: true, message: "แก้ไขอะไหล่สำเร็จ" });
  } catch (err) {
    await db.rollback();
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล",
    });
  }
});

// บันทึกการรับอะไหล่
router.post("/receive", isAuthenticated, async (req, res) => {
  const { part_id, quantity, note } = req.body;
  const mechanic_id = req.session.user.id;

  try {
    await db.beginTransaction();

    // อัพเดตจำนวนในสต็อก
    await queryAsync(
      `
            UPDATE parts 
            SET stock_quantity = COALESCE(stock_quantity, 0) + ? 
            WHERE id = ?
        `,
      [quantity, part_id]
    );

    // บันทึกประวัติการรับ
    await queryAsync(
      `
            INSERT INTO parts_history (
                part_id,
                transaction_type,
                quantity,
                mechanic_id,
                notes
            ) VALUES (?, ?, ?, ?, ?)
        `,
      [part_id, "รับ", quantity, mechanic_id, note || null]
    );

    await db.commit();
    res.json({ success: true, message: "รับอะไหล่สำเร็จ" });
  } catch (err) {
    await db.rollback();
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการรับอะไหล่",
    });
  }
});

// เพิ่มฟังก์ชันสำหรับตรวจสอบสต็อก
async function checkPartsStock(repairId) {
  try {
    // ดึงข้อมูลประเภทอุปกรณ์ของงานซ่อม
    const [repair] = await queryAsync(
      `
            SELECT device_type_id 
            FROM repair_info 
            WHERE id = ?
        `,
      [repairId]
    );

    if (!repair) return { hasStock: false, message: "ไม่พบข้อมูลงานซ่อม" };

    // ดึงข้อมูลอะไหล่ที่เกี่ยวข้องกับประเภทอุปกรณ์นี้
    const parts = await queryAsync(
      `
            SELECT p.id, p.name, p.stock_quantity, p.min_quantity
            FROM parts p
            JOIN parts_device_types pdt ON p.id = pdt.part_id
            WHERE pdt.device_type_id = ?
            AND p.stock_quantity <= p.min_quantity
        `,
      [repair.device_type_id]
    );

    if (parts.length > 0) {
      // มีอะไหล่ที่สต็อกต่ำหรือหมด
      const lowStockParts = parts.map((p) => p.name).join(", ");
      return {
        hasStock: false,
        message: `อะไหล่ในสต็อกมีไม่เพียงพอ:\n${lowStockParts}`,
        parts: parts,
      };
    }

    return { hasStock: true };
  } catch (err) {
    console.error("Error checking stock:", err);
    return { hasStock: false, message: "เกิดข้อผิดพลาดในการตรวจสอบสต็อก" };
  }
}

// แก้ไข route รับงานซ่อม
router.post("/accept", isAuthenticated, async (req, res) => {
  const { repairId } = req.body;
  const mechanic_id = req.session.user.id;

  try {
    // ตรวจสอบสต็อกก่อน
    const stockCheck = await checkPartsStock(repairId);

    await db.beginTransaction();

    if (stockCheck.hasStock) {
      // มีของในสต็อก - รับงานปกติ
      await queryAsync(
        `
                UPDATE repair_info 
                SET status_id = 2, mechanic_id = ?, updated_at = NOW()
                WHERE id = ?
            `,
        [mechanic_id, repairId]
      );

      await queryAsync(
        `
                INSERT INTO status_history (repair_id, status_id, mechanic_id, note)
                VALUES (?, 2, ?, 'รับงานซ่อม')
            `,
        [repairId, mechanic_id]
      );
    } else {
      // ไม่มีของในสต็อก - เปลี่ยนเป็นสถานะรออะไหล่
      await queryAsync(
        `
                UPDATE repair_info 
                SET status_id = 3, mechanic_id = ?, updated_at = NOW()
                WHERE id = ?
            `,
        [mechanic_id, repairId]
      );

      await queryAsync(
        `
                INSERT INTO status_history (repair_id, status_id, mechanic_id, note)
                VALUES (?, 3, ?, ?)
            `,
        [repairId, mechanic_id, `รับงานซ่อมและรออะไหล่: ${stockCheck.message}`]
      );
    }

    await db.commit();

    res.json({
      success: true,
      status: stockCheck.hasStock ? "working" : "waiting",
      message: stockCheck.hasStock ? "รับงานสำเร็จ" : "รับงานสำเร็จ (รออะไหล่)",
      details: stockCheck.message,
      parts: stockCheck.parts,
    });
  } catch (err) {
    await db.rollback();
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการรับงาน",
    });
  }
});

// ดูประวัติการเบิก-รับอะไหล่
router.get("/history", isAuthenticated, async (req, res) => {
  try {
    const history = await queryAsync(`
            SELECT 
                h.id,
                h.created_at,
                h.quantity,
                h.transaction_type,
                h.notes,
                p.name as part_name,
                p.price,
                m.first_name as mechanic_name,
                m.last_name as mechanic_lastname,
                r.repair_code
            FROM parts_history h
            JOIN parts p ON h.part_id = p.id
            JOIN mechanic m ON h.mechanic_id = m.id
            LEFT JOIN repair_info r ON h.repair_id = r.id
            ORDER BY h.created_at DESC
            LIMIT 100
        `);

    res.render("parts/history", {
      user: req.session.user,
      history,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("เกิดข้อผิดพลาดในการดึงข้อมูล");
  }
});

module.exports = router;
