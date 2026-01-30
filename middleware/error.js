// middleware/error.js
exports.notFound = (req, res, next) => {
    res.status(404).render('error', {
        title: 'ไม่พบหน้าที่คุณต้องการ',
        message: 'ขออภัย ไม่พบหน้าที่คุณต้องการ',
        error: {
            status: 404
        }
    });
};

exports.handler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).render('error', {
        title: 'เกิดข้อผิดพลาด',
        message: err.message || 'เกิดข้อผิดพลาดบางอย่าง',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
};