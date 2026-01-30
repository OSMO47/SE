// Utility functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }, 100);
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        const firstInput = modal.querySelector('input:not([type="hidden"])');
        if (firstInput) firstInput.focus();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            clearValidationErrors(form);
        }
    }
}

function clearValidationErrors(form) {
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
}

function showError(input, message) {
    input.classList.add('is-invalid');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    input.parentNode.appendChild(errorDiv);
}

function validateForm(formData) {
    const errors = {};
    
    if (!formData.get('name')?.trim()) {
        errors.name = 'กรุณากรอกชื่ออะไหล่';
    }

    const price = parseFloat(formData.get('price'));
    if (isNaN(price) || price < 0) {
        errors.price = 'กรุณากรอกราคาที่ถูกต้อง';
    }

    if (formData.get('stock_quantity')) {
        const stockQty = parseInt(formData.get('stock_quantity'));
        if (isNaN(stockQty) || stockQty < 0) {
            errors.stock_quantity = 'กรุณากรอกจำนวนที่ถูกต้อง';
        }
    }

    const minQty = parseInt(formData.get('min_quantity'));
    if (isNaN(minQty) || minQty < 0) {
        errors.min_quantity = 'กรุณากรอกจำนวนขั้นต่ำที่ถูกต้อง';
    }

    // ตรวจสอบการเลือกประเภทอุปกรณ์
    const deviceTypes = document.querySelectorAll('input[name="device_types[]"]:checked');
    if (deviceTypes.length === 0) {
        errors.device_types = 'กรุณาเลือกประเภทอุปกรณ์อย่างน้อย 1 ประเภท';
    }

    return errors;
}

// Add Part Functions
function showAddPartModal() {
    showModal('addPartModal');
}

async function handleAddPart(event) {
    event.preventDefault();
    const form = event.target;
    clearValidationErrors(form);

    const formData = new FormData(form);
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
        for (const [field, message] of Object.entries(errors)) {
            if (field === 'device_types') {
                const deviceTypesGroup = form.querySelector('.checkbox-grid');
                if (deviceTypesGroup) showError(deviceTypesGroup, message);
            } else {
                const input = form.querySelector(`[name="${field}"]`);
                if (input) showError(input, message);
            }
        }
        return false;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const deviceTypes = Array.from(form.querySelectorAll('input[name="device_types[]"]:checked'))
            .map(input => parseInt(input.value));

        const response = await fetch('/parts/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: formData.get('name'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                stock_quantity: parseInt(formData.get('stock_quantity')),
                min_quantity: parseInt(formData.get('min_quantity')),
                device_types: deviceTypes
            })
        });

        const result = await response.json();
        
        if (result.success) {
            showNotification('เพิ่มอะไหล่สำเร็จ');
            closeModal('addPartModal');
            setTimeout(() => location.reload(), 1500);
        } else {
            showNotification(result.message || 'เกิดข้อผิดพลาดในการเพิ่มอะไหล่', 'error');
            if (submitBtn) submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('เกิดข้อผิดพลาดในการเพิ่มอะไหล่', 'error');
        if (submitBtn) submitBtn.disabled = false;
    }

    return false;
}

// Edit Part Functions
function showEditPartModal(partId) {
    const row = document.querySelector(`tr[data-id="${partId}"]`);
    if (!row) return;

    // Fill form with current values
    document.getElementById('edit_part_id').value = partId;
    document.getElementById('edit_name').value = row.cells[1].textContent.trim();
    document.getElementById('edit_description').value = row.cells[2].textContent.trim();
    document.getElementById('edit_price').value = row.cells[4].textContent.replace(/[^\d.-]/g, '');
    document.getElementById('edit_min_quantity').value = row.cells[6].textContent.trim();

    // Check device type checkboxes
    const deviceTypeTags = Array.from(row.querySelector('.device-types').getElementsByClassName('device-type-tag'));
    const deviceTypeNames = deviceTypeTags.map(tag => tag.textContent.trim());

    document.querySelectorAll
    // Check device type checkboxes (continued)
    document.querySelectorAll('#editPartModal input[name="device_types[]"]').forEach(checkbox => {
        const label = checkbox.nextElementSibling.textContent.trim();
        checkbox.checked = deviceTypeNames.includes(label);
    });

    showModal('editPartModal');
}

async function handleEditPart(event) {
    event.preventDefault();
    const form = event.target;
    clearValidationErrors(form);

    const formData = new FormData(form);
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
        for (const [field, message] of Object.entries(errors)) {
            if (field === 'device_types') {
                const deviceTypesGroup = form.querySelector('.checkbox-grid');
                if (deviceTypesGroup) showError(deviceTypesGroup, message);
            } else {
                const input = form.querySelector(`[name="${field}"]`);
                if (input) showError(input, message);
            }
        }
        return false;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const deviceTypes = Array.from(form.querySelectorAll('input[name="device_types[]"]:checked'))
            .map(input => parseInt(input.value));

        const response = await fetch('/parts/edit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                part_id: formData.get('part_id'),
                name: formData.get('name'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                min_quantity: parseInt(formData.get('min_quantity')),
                device_types: deviceTypes
            })
        });

        const result = await response.json();
        
        if (result.success) {
            showNotification('แก้ไขอะไหล่สำเร็จ');
            closeModal('editPartModal');
            setTimeout(() => location.reload(), 1500);
        } else {
            showNotification(result.message || 'เกิดข้อผิดพลาดในการแก้ไขอะไหล่', 'error');
            if (submitBtn) submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('เกิดข้อผิดพลาดในการแก้ไขอะไหล่', 'error');
        if (submitBtn) submitBtn.disabled = false;
    }

    return false;
}

// Receive Part Functions
function showReceiveModal(partId) {
    document.getElementById('receive_part_id').value = partId;
    showModal('receiveModal');
}

async function handleReceivePart(event) {
    event.preventDefault();
    const form = event.target;
    clearValidationErrors(form);

    const quantity = parseInt(form.querySelector('[name="quantity"]').value);
    if (isNaN(quantity) || quantity <= 0) {
        showError(form.querySelector('[name="quantity"]'), 'กรุณากรอกจำนวนที่ถูกต้อง');
        return false;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const response = await fetch('/parts/receive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                part_id: form.querySelector('[name="part_id"]').value,
                quantity: quantity,
                note: form.querySelector('[name="note"]')?.value
            })
        });

        const result = await response.json();
        
        if (result.success) {
            showNotification('รับอะไหล่สำเร็จ');
            closeModal('receiveModal');
            setTimeout(() => location.reload(), 1500);
        } else {
            showNotification(result.message || 'เกิดข้อผิดพลาดในการรับอะไหล่', 'error');
            if (submitBtn) submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('เกิดข้อผิดพลาดในการรับอะไหล่', 'error');
        if (submitBtn) submitBtn.disabled = false;
    }

    return false;
}

// Search and Filter Functions
function filterTable() {
    const searchInput = document.getElementById('searchInput');
    const stockFilter = document.getElementById('stockFilter');
    const deviceTypeFilter = document.getElementById('deviceTypeFilter');
    const tableRows = document.querySelectorAll('.parts-table tbody tr');

    const searchTerm = searchInput?.value.toLowerCase() || '';
    const filterValue = stockFilter?.value || 'all';
    const deviceTypeValue = deviceTypeFilter?.value || 'all';

    tableRows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        const description = row.cells[2].textContent.toLowerCase();
        const deviceTypes = Array.from(row.querySelectorAll('.device-type-tag'))
            .map(tag => tag.textContent.trim());
        const stockQuantity = parseInt(row.cells[5].textContent);
        const minQuantity = parseInt(row.cells[6].textContent);

        // Search match
        const matchesSearch = name.includes(searchTerm) || 
                            description.includes(searchTerm);
        
        // Stock filter match
        let matchesStockFilter = true;
        if (filterValue === 'low') {
            matchesStockFilter = stockQuantity <= minQuantity && stockQuantity > 0;
        } else if (filterValue === 'out') {
            matchesStockFilter = stockQuantity === 0;
        }

        // Device type filter match
        let matchesDeviceType = true;
        if (deviceTypeValue !== 'all') {
            const filterTypeName = deviceTypeFilter.options[deviceTypeFilter.selectedIndex].text;
            matchesDeviceType = deviceTypes.includes(filterTypeName);
        }

        row.style.display = matchesSearch && matchesStockFilter && matchesDeviceType ? '' : 'none';
    });

    updateVisibleItemsCount();
}

function updateVisibleItemsCount() {
    const tableRows = document.querySelectorAll('.parts-table tbody tr');
    const visibleRows = Array.from(tableRows).filter(row => row.style.display !== 'none');
    
    const countDisplay = document.getElementById('visibleItemsCount');
    if (countDisplay) {
        countDisplay.textContent = `กำลังแสดง ${visibleRows.length} รายการ`;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const stockFilter = document.getElementById('stockFilter');
    const deviceTypeFilter = document.getElementById('deviceTypeFilter');
    
    if (searchInput) searchInput.addEventListener('input', filterTable);
    if (stockFilter) stockFilter.addEventListener('change', filterTable);
    if (deviceTypeFilter) deviceTypeFilter.addEventListener('change', filterTable);

    // Close modals when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    };

    // Initialize stats
    updatePartsStats();
});

function updatePartsStats() {
    const tableRows = document.querySelectorAll('.parts-table tbody tr');
    const lowStock = Array.from(tableRows).filter(row => {
        const stockQty = parseInt(row.querySelector('.stock-badge').textContent);
        const minQty = parseInt(row.cells[6].textContent);
        return stockQty <= minQty && stockQty > 0;
    });
    const outOfStock = Array.from(tableRows).filter(row => {
        return parseInt(row.querySelector('.stock-badge').textContent) === 0;
    });

    // Update stats display
    document.getElementById('totalParts').textContent = tableRows.length;
    document.getElementById('lowStockCount').textContent = lowStock.length;
    document.getElementById('outOfStockCount').textContent = outOfStock.length;
}