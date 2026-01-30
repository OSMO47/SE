// /public/js/repair.js

// Constants
const API_ENDPOINTS = {
    CREATE: '/repair/create',
    ACCEPT: '/repair/accept',
    UPDATE_STATUS: '/repair/update-status',
    GET_TOTAL: '/repair/get-total',
    PAYMENT: '/repair/payment',
    DEVICE_HISTORY: '/repair/device-history'
};

let repairCounter = 0;  // นับจำนวนรายการซ่อม

// Utility Functions
function showNotification(message, type = 'success') {
    // ลบ notification เก่า
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    // สร้าง notification ใหม่
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '9999';
    notification.style.animation = 'slideIn 0.5s forwards';
    notification.style.minWidth = '300px';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '10px';
    notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    
    // กำหนดสีและ icon ตามประเภท
    let backgroundColor, icon;
    switch(type) {
        case 'success':
            backgroundColor = '#4caf50';
            icon = '✅';
            break;
        case 'error':
            backgroundColor = '#f44336';
            icon = '❌';
            break;
        case 'info':
            backgroundColor = '#2196f3';
            icon = 'ℹ️';
            break;
        case 'warning':
            backgroundColor = '#ff9800';
            icon = '⚠️';
            break;
        default:
            backgroundColor = '#4caf50';
            icon = '✅';
    }

    notification.style.backgroundColor = backgroundColor;
    notification.style.color = 'white';
    
    // สร้าง icon element
    const iconElement = document.createElement('span');
    iconElement.textContent = icon;
    iconElement.style.fontSize = '20px';
    
    // สร้าง message element
    const messageElement = document.createElement('span');
    messageElement.textContent = message;
    messageElement.style.flex = '1';
    
    // สร้างปุ่มปิด
    const closeButton = document.createElement('span');
    closeButton.textContent = '×';
    closeButton.style.cursor = 'pointer';
    closeButton.style.marginLeft = '10px';
    closeButton.style.fontSize = '20px';
    closeButton.onclick = () => notification.remove();

    // เพิ่ม elements เข้าใน notification
    notification.appendChild(iconElement);
    notification.appendChild(messageElement);
    notification.appendChild(closeButton);
    
    // เพิ่ม animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        .notification {
            transition: all 0.3s ease;
        }
        .notification:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // ลบ notification หลังจาก 5 วินาที
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s forwards';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

function setButtonLoading(button, isLoading, text = 'บันทึก') {
    if (!button) return;
    button.disabled = isLoading;
    button.innerHTML = isLoading ? 
        '<i class="ri-loader-4-line ri-spin"></i> กำลังบันทึก...' : 
        `<i class="ri-save-line"></i> ${text}`;
}

// Form Functions
function calculateTotals(repairItem) {
    let laborTotal = 0;
    let partsTotal = 0;

    repairItem.querySelectorAll('input[name*="repair_types"]:checked').forEach(checkbox => {
        laborTotal += parseFloat(checkbox.dataset.price || 0);
    });

    repairItem.querySelectorAll('input[name*="parts"]:checked').forEach(checkbox => {
        const quantity = parseInt(checkbox.closest('.part-card')
            .querySelector('input[name*="parts_quantity"]').value || 1);
        partsTotal += parseFloat(checkbox.dataset.price || 0) * quantity;
    });

    const totalSection = repairItem.querySelector('.total-section');
    if (totalSection) {
        totalSection.querySelector('.labor-total').textContent = `฿${laborTotal.toLocaleString()}`;
        totalSection.querySelector('.parts-total').textContent = `฿${partsTotal.toLocaleString()}`;
        totalSection.querySelector('.total-amount').textContent = 
            `฿${(laborTotal + partsTotal).toLocaleString()}`;
        
        showNotification('อัพเดตราคาเรียบร้อย', 'info');
    }
}

// Event Handlers
function handlePartCheckbox(checkbox) {
    const quantityDiv = checkbox.closest('.part-card').querySelector('.part-quantity');
    if (quantityDiv) {
        quantityDiv.style.display = checkbox.checked ? 'block' : 'none';
        calculateTotals(checkbox.closest('.repair-item'));
    }
}

function handleQuantityChange(input) {
    const repairItem = input.closest('.repair-item');
    if (repairItem) {
        calculateTotals(repairItem);
    }
}

function handleRepairTypeChange(checkbox) {
    const repairItem = checkbox.closest('.repair-item');
    if (repairItem) {
        calculateTotals(repairItem);
    }
}

function handlePartSearch(input) {
    const searchTerm = input.value.toLowerCase();
    const partsGrid = input.closest('.repair-column').querySelector('.parts-grid');
    
    partsGrid.querySelectorAll('.part-card').forEach(card => {
        const name = card.querySelector('.part-name').textContent.toLowerCase();
        const desc = card.querySelector('.part-description').textContent.toLowerCase();
        card.style.display = (name.includes(searchTerm) || desc.includes(searchTerm)) ? 'flex' : 'none';
    });
}

function createNewRepairItem() {
    repairCounter++;
    const template = document.querySelector('.repair-item').cloneNode(true);
    template.dataset.index = repairCounter;

    // อัพเดต IDs และ names
    template.querySelectorAll('[id]').forEach(el => {
        el.id = el.id.replace('_0_', `_${repairCounter}_`);
    });
    template.querySelectorAll('[name]').forEach(el => {
        el.name = el.name.replace('repairs[0]', `repairs[${repairCounter}]`);
    });
    template.querySelectorAll('[for]').forEach(el => {
        el.setAttribute('for', el.getAttribute('for').replace('_0_', `_${repairCounter}_`));
    });

    // แสดงปุ่มลบ
    const removeButton = template.querySelector('.btn-remove-item');
    if (removeButton) {
        removeButton.style.display = 'flex';
        removeButton.onclick = () => {
            if (confirm('ต้องการลบรายการซ่อมนี้ใช่หรือไม่?')) {
                template.remove();
            }
        };
    }

    // อัพเดตหัวข้อ
    template.querySelector('h2').textContent = `รายการซ่อมที่ ${repairCounter + 1}`;

    // รีเซ็ตค่าต่างๆ
    template.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    template.querySelectorAll('.part-quantity').forEach(div => div.style.display = 'none');
    template.querySelector('.device-type-select').value = '';
    template.querySelector('.device-description').value = '';
    const deviceCodeInput = template.querySelector('.device-code-input');
    if (deviceCodeInput) {
        deviceCodeInput.value = '';
    }
    template.querySelector('.part-search').value = '';

    // ตั้งค่า event handlers
    setupRepairItemEvents(template);

    // เพิ่มเข้าไปใน container
    document.getElementById('repair-items-container').appendChild(template);
}

function setupRepairItemEvents(repairItem) {
    // Part search
    repairItem.querySelector('.part-search')?.addEventListener('input', e => handlePartSearch(e.target));

    // Part checkboxes
    repairItem.querySelectorAll('input[name*="parts"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => handlePartCheckbox(checkbox));
    });

    // Quantity inputs
    repairItem.querySelectorAll('input[name*="parts_quantity"]').forEach(input => {
        input.addEventListener('change', () => handleQuantityChange(input));
    });

    // Repair type checkboxes
    repairItem.querySelectorAll('input[name*="repair_types"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => handleRepairTypeChange(checkbox));
    });

    const deviceCodeInput = repairItem.querySelector('.device-code-input');
    const checkButton = repairItem.querySelector('.btn-check-device');
    if (deviceCodeInput && checkButton) {
        checkButton.addEventListener('click', () => handleDeviceHistoryCheck(repairItem));
        deviceCodeInput.addEventListener('blur', () => handleDeviceHistoryCheck(repairItem, true));
    }
}

function formatCurrency(amount) {
    return `฿${Number(amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH');
}

async function handleDeviceHistoryCheck(repairItem, isSilent = false) {
    const input = repairItem.querySelector('.device-code-input');
    if (!input) return;

    const deviceCode = input.value.trim();
    if (!deviceCode) {
        if (!isSilent) showNotification('กรุณากรอกรหัสเครื่องก่อนตรวจสอบ', 'warning');
        return;
    }

    try {
        if (!isSilent) showNotification('กำลังตรวจสอบประวัติการซ่อม...', 'info');
        const response = await fetch(`${API_ENDPOINTS.DEVICE_HISTORY}?device_code=${encodeURIComponent(deviceCode)}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'ไม่สามารถตรวจสอบประวัติได้');
        }

        if (result.history.length === 0) {
            if (!isSilent) showNotification('ไม่พบประวัติการซ่อมจากรหัสเครื่องนี้', 'info');
            return;
        }

        openDeviceHistoryModal(deviceCode, result.history);
    } catch (error) {
        console.error('Error:', error);
        if (!isSilent) showNotification(`เกิดข้อผิดพลาดในการตรวจสอบ: ${error.message}`, 'error');
    }
}

function openDeviceHistoryModal(deviceCode, history) {
    const modal = document.getElementById('deviceHistoryModal');
    const tableBody = document.getElementById('deviceHistoryTableBody');
    const emptyState = document.getElementById('deviceHistoryEmpty');
    const codeLabel = document.getElementById('historyDeviceCode');

    if (!modal || !tableBody || !emptyState || !codeLabel) return;

    codeLabel.textContent = deviceCode;
    tableBody.innerHTML = '';

    if (!history.length) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        history.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.repair_code || '-'}</td>
                <td>${item.customer_name || '-'}<br><small>${item.phone_number || '-'}</small></td>
                <td>${item.device_type || '-'}<br><small>${item.device_description || '-'}</small></td>
                <td>${item.repair_types || '-'}</td>
                <td>${formatCurrency(item.total_amount)}</td>
                <td>${formatDate(item.created_at)}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    modal.style.display = 'block';
}

function closeDeviceHistoryModal() {
    const modal = document.getElementById('deviceHistoryModal');
    if (modal) {
        modal.style.display = 'none';
    }
}
async function showPaymentModal(repairId) {
    try {
        const response = await fetch(`${API_ENDPOINTS.GET_TOTAL}/${repairId}`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('payment_repair_id').value = repairId;
            document.getElementById('totalAmount').textContent = 
                `฿${Number(data.total).toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
            document.getElementById('paymentModal').style.display = 'block';
            showNotification('กรุณาเลือกวิธีการชำระเงิน', 'info');
        } else {
            throw new Error('ไม่สามารถดึงข้อมูลยอดเงินได้');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + error.message, 'error');
    }
}
function autofillTestData() {
    // กรอกข้อมูลลูกค้า
    document.getElementById('customer_first_name').value = 'ทดสอบ';
    document.getElementById('customer_last_name').value = 'สมมติ';
    document.getElementById('customer_phone').value = '0123456789';

    // กรอกข้อมูลรายการซ่อมที่ 1
    document.querySelector('[name="repairs[0][device_type_id]"]').value = '1'; // เลือกประเภทอุปกรณ์
    document.querySelector('[name="repairs[0][device_description]"]').value = 'มือถือ Samsung รุ่น Galaxy S21 มีอาการหน้าจอแตก';

    // กรอกข้อมูลรายการซ่อม (รายการซ่อมที่ 1)
    const checkboxes = document.querySelectorAll('[name="repairs[0][repair_types][]"]');
    checkboxes.forEach((checkbox) => {
        checkbox.checked = true; // เลือกทุกตัวเลือก
    });

    // กรอกข้อมูลอะไหล่ที่มีในสต็อก
    const partCheckboxes = document.querySelectorAll('[name="repairs[0][parts][]"]');
    partCheckboxes.forEach((checkbox) => {
        checkbox.checked = true; // เลือกทุกอะไหล่
    });

    // กรอกจำนวนอะไหล่
    const quantities = document.querySelectorAll('[name="repairs[0][parts_quantity][]"]');
    quantities.forEach((input) => {
        input.value = '1'; // กรอกจำนวน 1 ชิ้น
    });

    // คำนวณราคารวม (ถ้ามี)
    updateTotal(); // ต้องเรียกใช้ฟังก์ชันนี้เพื่ออัปเดตราคารวม
}

async function handleUpdate(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        repair_id: formData.get('repair_id'),
        status_id: formData.get('status_id'),
        notes: formData.get('notes')?.trim() || ''
    };

    try {
        showNotification('กำลังอัพเดตสถานะ...', 'info');

        // กรณีซ่อมเสร็จ (status_id = 4)
        if (data.status_id === '4') {
            closeUpdateModal();
            await showPaymentModal(data.repair_id);
            return false;
        }

        // กรณีส่งมอบ (status_id = 5)
        if (data.status_id === '5') {
            const checkPaymentResponse = await fetch(`/repair/check-payment/${data.repair_id}`);
            const paymentStatus = await checkPaymentResponse.json();
            
            if (!paymentStatus.is_paid) {
                closeUpdateModal();
                await showPaymentModal(data.repair_id);
                return false;
            }
        }

        const response = await fetch(API_ENDPOINTS.UPDATE_STATUS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('อัพเดตสถานะสำเร็จ', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            throw new Error(result.message || 'เกิดข้อผิดพลาดในการอัพเดตสถานะ');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message, 'error');
    }
}

function showUpdateModal(repairId, currentStatus) {
    document.getElementById('update_repair_id').value = repairId;
    const statusSelect = document.getElementById('status');
    statusSelect.value = currentStatus;
    
    // ปรับตัวเลือกตามลำดับ
    Array.from(statusSelect.options).forEach(option => {
        const optionValue = parseInt(option.value);
        const currentStatusValue = parseInt(currentStatus);
        
        // ตรวจสอบเงื่อนไขการแสดงตัวเลือก
        let shouldDisable = false;

        // กรณีสถานะปัจจุบันคือ "ซ่อมเสร็จ" (4)
        if (currentStatusValue === 4) {
            shouldDisable = optionValue !== 5 && optionValue !== 4;
        } 
        // กรณีสถานะอื่นๆ
        else {
            shouldDisable = optionValue < currentStatusValue || 
                          (currentStatusValue === 5) || 
                          (optionValue === 6 && currentStatusValue < 4) ||
                          (optionValue === 5 && currentStatusValue !== 4);
        }

        option.disabled = shouldDisable;
    });
    
    document.getElementById('updateModal').style.display = 'block';
}
function closeUpdateModal() {
    const modal = document.getElementById('updateModal');
    if (modal) {
        modal.style.display = 'none';
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}
async function handlePayment(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        repair_id: formData.get('repair_id'),
        payment_method_id: formData.get('payment_method_id'),
        reference_no: formData.get('reference_no') || null
    };

    if (data.payment_method_id !== '1' && !data.reference_no) {
        showNotification('กรุณากรอกเลขที่อ้างอิง/สลิป', 'error');
        return false;
    }

    try {
        showNotification('กำลังบันทึกการชำระเงิน...', 'info');

        const response = await fetch(API_ENDPOINTS.PAYMENT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('บันทึกการชำระเงินสำเร็จ', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            throw new Error(result.message || 'เกิดข้อผิดพลาดในการชำระเงิน');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message, 'error');
    }
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    document.getElementById('paymentForm').reset();
    document.getElementById('referenceNoGroup').style.display = 'none';
}
function autofillTestData() {
    // กรอกข้อมูลลูกค้า
    document.getElementById('customer_first_name').value = 'ทดสอบ';
    document.getElementById('customer_last_name').value = 'สมมติ';
    document.getElementById('customer_phone').value = '0123456789';

    // กรอกข้อมูลรายการซ่อมที่ 1
    document.querySelector('[name="repairs[0][device_type_id]"]').value = '1'; // เลือกประเภทอุปกรณ์
    document.querySelector('[name="repairs[0][device_description]"]').value = 'มือถือ Samsung รุ่น Galaxy S21 มีอาการหน้าจอแตก';

    // กรอกข้อมูลรายการซ่อม (รายการซ่อมที่ 1)
    const checkboxes = document.querySelectorAll('[name="repairs[0][repair_types][]"]');
    checkboxes.forEach((checkbox) => {
        checkbox.checked = true; // เลือกทุกตัวเลือก
    });

    // กรอกข้อมูลอะไหล่ที่มีในสต็อก
    const partCheckboxes = document.querySelectorAll('[name="repairs[0][parts][]"]');
    partCheckboxes.forEach((checkbox) => {
        checkbox.checked = true; // เลือกทุกอะไหล่
        const card = checkbox.closest('.part-card');
        if (card) {
            const quantityDiv = card.querySelector('.part-quantity');
            if (quantityDiv) {
                quantityDiv.style.display = 'block';
            }
        }
    });

    // กรอกจำนวนอะไหล่
    const quantities = document.querySelectorAll('[name="repairs[0][parts_quantity][]"]');
    quantities.forEach((input) => {
        input.value = '1'; // กรอกจำนวน 1 ชิ้น
    });

    // คำนวณราคารวม
    const firstRepairItem = document.querySelector('.repair-item');
    if (firstRepairItem) {
        calculateTotals(firstRepairItem);
    }
}
// Form Submission
// /public/js/repair.js
async function handleCreateForm(event) {
    event.preventDefault();
    if (window.isSubmitting) return;
 
    const submitButton = event.target.querySelector('button[type="submit"]');
    
    try {
        showNotification('กำลังตรวจสอบข้อมูล...', 'info');
        
        // รวบรวมข้อมูลจากฟอร์ม
        const formData = {
            customer_first_name: document.getElementById('customer_first_name').value.trim(),
            customer_last_name: document.getElementById('customer_last_name').value.trim(), 
            customer_phone: document.getElementById('customer_phone').value.trim(),
            
            // รวบรวมข้อมูลการซ่อมทั้งหมด
            repairs: Array.from(document.querySelectorAll('.repair-item')).map((item, index) => {
                const deviceTypeSelect = item.querySelector(`select[name="repairs[${index}][device_type_id]"]`);
                const deviceDescription = item.querySelector(`textarea[name="repairs[${index}][device_description]"]`);
                const deviceCode = item.querySelector(`input[name="repairs[${index}][device_code]"]`);
                
                // รายการซ่อม
                const repairTypes = Array.from(
                    item.querySelectorAll(`input[name="repairs[${index}][repair_types][]"]:checked`)
                ).map(checkbox => parseInt(checkbox.value));
                
                // อะไหล่ที่ใช้
                const parts = [];
                const quantities = [];
                
                item.querySelectorAll(`input[name="repairs[${index}][parts][]"]:checked`).forEach(checkbox => {
                    const card = checkbox.closest('.part-card');
                    const quantity = card.querySelector('input[type="number"]').value;
                    parts.push(parseInt(checkbox.value));
                    quantities.push(parseInt(quantity));
                });
 
                return {
                    device_type_id: parseInt(deviceTypeSelect.value),
                    device_description: deviceDescription.value.trim(),
                    device_code: deviceCode ? deviceCode.value.trim() : null,
                    repair_types: repairTypes,
                    parts: parts,
                    quantities: quantities
                };
            })
        };
 
        console.log('Sending data:', formData);
 
        // ตรวจสอบข้อมูล
        if (!formData.customer_first_name || !formData.customer_last_name || !formData.customer_phone) {
            showNotification('กรุณากรอกข้อมูลลูกค้าให้ครบถ้วน', 'error');
            throw new Error('กรุณากรอกข้อมูลลูกค้าให้ครบถ้วน');
        }
 
        if (!formData.repairs.length) {
            showNotification('กรุณาเพิ่มรายการซ่อมอย่างน้อย 1 รายการ', 'error'); 
            throw new Error('กรุณาเพิ่มรายการซ่อมอย่างน้อย 1 รายการ');
        }
 
        formData.repairs.forEach((repair, index) => {
            if (!repair.device_type_id) {
                showNotification(`กรุณาเลือกประเภทอุปกรณ์ในรายการที่ ${index + 1}`, 'error');
                throw new Error(`กรุณาเลือกประเภทอุปกรณ์ในรายการที่ ${index + 1}`);
            }
            if (!repair.device_description) {
                showNotification(`กรุณากรอกรายละเอียดอุปกรณ์ในรายการที่ ${index + 1}`, 'error');
                throw new Error(`กรุณากรอกรายละเอียดอุปกรณ์ในรายการที่ ${index + 1}`);
            }
            if (!repair.device_code) {
                showNotification(`กรุณากรอกรหัสเครื่องในรายการที่ ${index + 1}`, 'error');
                throw new Error(`กรุณากรอกรหัสเครื่องในรายการที่ ${index + 1}`);
            }
            if (!repair.repair_types.length) {
                showNotification(`กรุณาเลือกรายการซ่อมในรายการที่ ${index + 1}`, 'error');
                throw new Error(`กรุณาเลือกรายการซ่อมในรายการที่ ${index + 1}`);
            }
        });
 
        showNotification('กำลังบันทึกข้อมูล...', 'info');
        setButtonLoading(submitButton, true);
 
        const response = await fetch('/repair/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
 
        const result = await response.json();
 
        if (!response.ok) {
            showNotification(result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
            throw new Error(result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
 
        showNotification('บันทึกข้อมูลสำเร็จ! กำลังนำท่านไปยังรายการซ่อม...', 'success');
        setTimeout(() => window.location.href = '/repair/list', 2000);
 
    } catch (error) {
        console.error('Error:', error);
        if (!error.message.includes('กรุณา')) { // ถ้าไม่ใช่ error จากการ validate
            showNotification('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message, 'error');
        }
    } finally {
        setButtonLoading(submitButton, false);
    }
 }

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('createRepairForm');
    if (form) {
        form.addEventListener('submit', handleCreateForm);
        setupRepairItemEvents(document.querySelector('.repair-item'));
    }

    // Add repair item button
    document.getElementById('addRepairItem')?.addEventListener('click', createNewRepairItem);

    // Phone number validation
    const phoneInput = document.getElementById('customer_phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', e => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
        });
    }

    // Setup update form handler
    const updateForm = document.getElementById('updateForm');
    if (updateForm) {
        updateForm.addEventListener('submit', handleUpdate);
    }

    // Setup payment form handler
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePayment);
    }

    // จัดการการแสดง/ซ่อนช่องกรอกเลขที่อ้างอิง
    const paymentMethod = document.getElementById('payment_method');
    if (paymentMethod) {
        paymentMethod.addEventListener('change', function(e) {
            const referenceNoGroup = document.getElementById('referenceNoGroup');
            referenceNoGroup.style.display = e.target.value === '1' ? 'none' : 'block';
        });
    }

    // เพิ่ม event listener สำหรับปุ่มปิด modal
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal.id === 'updateModal') {
                closeUpdateModal();
            } else if (modal.id === 'paymentModal') {
                closePaymentModal();
            } else if (modal.id === 'deviceHistoryModal') {
                closeDeviceHistoryModal();
            }
        });
    });

    // จัดการการปิด Modal เมื่อคลิกพื้นหลัง
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            const modalId = event.target.id;
            if (modalId === 'updateModal') closeUpdateModal();
            else if (modalId === 'paymentModal') closePaymentModal();
            else if (modalId === 'deviceHistoryModal') closeDeviceHistoryModal();
        }
    };
});


// Error handling
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showNotification('เกิดข้อผิดพลาดในการทำงาน กรุณาลองใหม่อีกครั้ง', 'error');
});
