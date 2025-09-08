const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer')
const PORT = 4000;

app.use(cors());
// Increase the payload limit to handle multiple items
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'shophub',
});

// Function to convert image URL to base64
const convertImageUrlToBase64 = async (imageUrl) => {
    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 10000, // 10 second timeout
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        return base64;
    } catch (error) {
        throw new Error(`Failed to fetch image: ${error.message}`);
    }
};

// UPDATED: Create order with customer information
app.post('/api/orders/insert', (req, res) => {
    const { 
        email, 
        totalAmount, 
        items, 
        customerInfo 
    } = req.body;

    // Validate required fields
    if (!email || !totalAmount || !items || !Array.isArray(items) || !customerInfo) {
        return res.status(400).json({ 
            success: false,
            error: 'Missing required fields: email, totalAmount, items array, and customerInfo' 
        });
    }

    // Validate customer information
    const requiredCustomerFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'postalCode'];
    const missingFields = requiredCustomerFields.filter(field => !customerInfo[field] || customerInfo[field].trim() === '');
    
    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            error: `Missing customer information: ${missingFields.join(', ')}`
        });
    }

    // Convert items array to string format
    const itemNames = items.map(item => 
        `${item.name || 'Unknown Item'} (Qty: ${item.quantity || 1}, Price: $${item.price || 0})`
    ).join(', ');

    const query = `
        INSERT INTO orders (
            email, 
            items, 
            totalAmount,
            customer_name,
            customer_email,
            customer_phone,
            customer_address,
            customer_city,
            customer_state,
            customer_postal_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        email,
        itemNames,
        totalAmount,
        customerInfo.name.trim(),
        customerInfo.email.trim(),
        customerInfo.phone.trim(),
        customerInfo.address.trim(),
        customerInfo.city.trim(),
        customerInfo.state.trim(),
        customerInfo.postalCode.trim()
    ];

    console.log('Processing order for:', email);
    console.log('Customer Info:', customerInfo);
    console.log('Items:', itemNames);
    console.log('Total Amount:', totalAmount);

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting order:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Error creating order', 
                details: err.message 
            });
        }
        
        console.log('Order created successfully with ID:', result.insertId);
        res.json({ 
            success: true,
            message: 'Order placed successfully', 
            orderId: result.insertId 
        });
    });
});

// Create a new order - UPDATED VERSION
app.post('/api/orders', (req, res) => {
    const { email, items, totalAmount, customerInfo } = req.body;
    
    // Convert array of item objects to comma-separated string of names
    const itemNames = Array.isArray(items) 
        ? items.map(item => `${item.name} (Qty: ${item.quantity})`).join(', ')
        : items;
    
    const query = `
        INSERT INTO orders (
            email, 
            items, 
            totalAmount,
            customer_name,
            customer_email,
            customer_phone,
            customer_address,
            customer_city,
            customer_state,
            customer_postal_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = customerInfo ? [
        email,
        itemNames,
        totalAmount,
        customerInfo.name || '',
        customerInfo.email || email,
        customerInfo.phone || '',
        customerInfo.address || '',
        customerInfo.city || '',
        customerInfo.state || '',
        customerInfo.postalCode || ''
    ] : [email, itemNames, totalAmount, '', email, '', '', '', '', ''];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error creating order:', err);
            return res.status(500).json({ error: 'Error creating order' });
        }
        
        res.json({
            success: true,
            message: 'Order created successfully',
            orderId: result.insertId
        });
    });
});

// NEW: Get all orders with pagination and filtering options
app.get('/api/orders', (req, res) => {
    const { page = 1, limit = 10, status, email, sortBy = 'order_date', sortOrder = 'DESC' } = req.query;
    
    let query = 'SELECT * FROM orders';
    let countQuery = 'SELECT COUNT(*) as total FROM orders';
    let conditions = [];
    let values = [];
    
    // Add filters
    if (status) {
        conditions.push('order_status = ?');
        values.push(status);
    }
    
    if (email) {
        conditions.push('(email LIKE ? OR customer_email LIKE ?)');
        values.push(`%${email}%`, `%${email}%`);
    }
    
    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
        const whereClause = ' WHERE ' + conditions.join(' AND ');
        query += whereClause;
        countQuery += whereClause;
    }
    
    // Add sorting
    const validSortColumns = ['id', 'order_date', 'totalAmount', 'order_status', 'customer_name'];
    const validSortOrders = ['ASC', 'DESC'];
    
    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder.toUpperCase())) {
        query += ` ORDER BY ${sortBy} ${sortOrder}`;
    }
    
    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;
    
    // First get the total count
    db.query(countQuery, values, (err, countResult) => {
        if (err) {
            console.error('Error counting orders:', err);
            return res.status(500).json({ error: 'Error fetching orders count' });
        }
        
        const totalOrders = countResult[0].total;
        const totalPages = Math.ceil(totalOrders / parseInt(limit));
        
        // Then get the orders
        db.query(query, values, (err, results) => {
            if (err) {
                console.error('Error fetching orders:', err);
                return res.status(500).json({ error: 'Error fetching orders' });
            }
            
            // Format the response
            const orders = results.map(order => ({
                ...order,
                items: order.items ? order.items.split(', ') : [],
                order_date: new Date(order.order_date).toISOString()
            }));
            
            res.json({
                success: true,
                orders: orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: totalPages,
                    totalOrders: totalOrders,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            });
        });
    });
});

// NEW: Get orders summary/statistics
app.get('/api/orders/summary', (req, res) => {
    const summaryQuery = `
        SELECT 
            COUNT(*) as total_orders,
            SUM(totalAmount) as total_revenue,
            AVG(totalAmount) as average_order_value,
            COUNT(CASE WHEN order_status = 'pending' THEN 1 END) as pending_orders,
            COUNT(CASE WHEN order_status = 'confirmed' THEN 1 END) as confirmed_orders,
            COUNT(CASE WHEN order_status = 'shipped' THEN 1 END) as shipped_orders,
            COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as delivered_orders,
            COUNT(CASE WHEN order_status = 'cancelled' THEN 1 END) as cancelled_orders
        FROM orders
    `;
    
    db.query(summaryQuery, (err, results) => {
        if (err) {
            console.error('Error fetching orders summary:', err);
            return res.status(500).json({ error: 'Error fetching orders summary' });
        }
        
        res.json({
            success: true,
            summary: results[0]
        });
    });
});

// NEW: Update order status
app.put('/api/orders/:id/status', (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
        });
    }
    
    const query = 'UPDATE orders SET order_status = ? WHERE id = ?';
    
    db.query(query, [status, orderId], (err, result) => {
        if (err) {
            console.error('Error updating order status:', err);
            return res.status(500).json({ error: 'Error updating order status' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json({
            success: true,
            message: 'Order status updated successfully'
        });
    });
});

// UPDATED: Get order by ID with customer information
app.get('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;
    
    const query = 'SELECT * FROM orders WHERE id = ?';
    
    db.query(query, [orderId], (err, results) => {
        if (err) {
            console.error('Error fetching order:', err);
            return res.status(500).json({ error: 'Error fetching order' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Format the response
        const order = results[0];
        order.items = order.items.split(', '); // Convert string back to array
        
        res.json(order);
    });
});

// UPDATED: Get orders by email with customer information
app.get('/api/orders/user/:email', (req, res) => {
    const userEmail = req.params.email;
    
    const query = 'SELECT * FROM orders WHERE email = ? ORDER BY order_date DESC';
    
    db.query(query, [userEmail], (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ error: 'Error fetching orders' });
        }
        
        // Format the response
        const orders = results.map(order => ({
            ...order,
            items: order.items.split(', ') // Convert string back to array
        }));
        
        res.json(orders);
    });
});

// UPDATED: Endpoint to get all models with BLOB to base64 conversion
app.get('/api/models', (req, res) => {
    const query = 'SELECT * FROM models ORDER BY id DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching models:', err);
            return res.status(500).json({ error: 'Error fetching models' });
        }
        
        // No need to process the photo data as it's already stored with data URL prefix
        res.json(results);
    });
});

// UPDATED: Endpoint to add a new model with image URL conversion
app.post('/api/models', async (req, res) => {
    const { model_name, rating, price, category, photo } = req.body;
    
    try {
        let photoBase64 = null;
        
        // Handle different types of photo input
        if (photo && photo.trim() !== '') {
            if (photo.startsWith('data:image')) {
                // If it's already base64, extract the base64 part
                photoBase64 = photo.split(',')[1];
            } else if (photo.startsWith('http')) {
                // If it's a URL, convert it to base64
                try {
                    photoBase64 = await convertImageUrlToBase64(photo);
                } catch (imageError) {
                    return res.status(400).json({ 
                        error: 'Invalid image URL or unable to fetch image: ' + imageError.message 
                    });
                }
            } else {
                // Assume it's already base64 without the data prefix
                photoBase64 = photo;
            }
        }
        
        const query = `
            INSERT INTO models (model_name, rating, price, category, photo)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        db.query(query, [model_name, rating, price, category, photoBase64], (err, result) => {
            if (err) {
                console.error('Error adding model:', err);
                return res.status(500).json({ error: 'Error adding model' });
            }
            res.json({
                success: true,
                message: 'Model added successfully',
                id: result.insertId
            });
        });
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// CORRECTED: Admin gallery insert endpoint - Fixed to handle base64 images properly
app.post('/api/gallery/insert', async (req, res) => {
    const {
        model_name,
        rating,
        price,
        category,
        photo
    } = req.body;

    console.log('Received data:', { 
        model_name, 
        rating, 
        price, 
        category, 
        photoLength: photo ? photo.length : 0
    });

    try {
        let photoData = null;
        
        if (photo && photo.trim() !== '') {
            // If it's a data URL, extract the base64 part
            if (photo.startsWith('data:image')) {
                const matches = photo.match(/^data:(.+);base64,(.+)$/);
                if (matches) {
                    const [, mimeType, base64Data] = matches;
                    photoData = 'data:' + mimeType + ';base64,' + base64Data;
                    console.log('Processed data URL with mime type:', mimeType);
                }
            } else {
                // If it's just base64, add proper data URL prefix
                try {
                    // Try to detect image format from base64 header
                    const decoded = Buffer.from(photo, 'base64');
                    let mimeType = 'image/jpeg'; // default

                    if (decoded[0] === 0x89 && decoded[1] === 0x50) {
                        mimeType = 'image/png';
                    } else if (decoded[0] === 0xFF && decoded[1] === 0xD8) {
                        mimeType = 'image/jpeg';
                    } else if (decoded.slice(0, 3).toString() === 'GIF') {
                        mimeType = 'image/gif';
                    }

                    photoData = `data:${mimeType};base64,${photo}`;
                    console.log('Added data URL prefix with detected mime type:', mimeType);
                } catch (e) {
                    console.error('Error processing base64 data:', e);
                    return res.status(400).json({ error: 'Invalid image data' });
                }
            }
        }

        const query = `
        INSERT INTO models 
        (model_name, rating, price, category, photo) 
        VALUES(?, ?, ?, ?, ?)`;

        db.query(query, [
            model_name,
            rating,
            price,
            category,
            photoData
        ], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: err.message });
            }

            console.log('Model inserted successfully with ID:', result.insertId);
            res.json({ 
                success: true,
                message: 'Model Added Successfully', 
                id: result.insertId 
            });
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// NEW: Update model
app.put('/api/models/:id', async (req, res) => {
    const { id } = req.params;
    const {
        model_name,
        rating,
        price,
        category,
        photo
    } = req.body;

    try {
        let photoBase64 = null;
        
        // Handle different types of photo input
        if (photo && photo.trim() !== '') {
            if (photo.startsWith('data:image')) {
                // If it's already base64, extract the base64 part
                photoBase64 = photo.split(',')[1];
            } else if (photo.startsWith('http')) {
                // If it's a URL, convert it to base64
                try {
                    photoBase64 = await convertImageUrlToBase64(photo);
                } catch (imageError) {
                    return res.status(400).json({ 
                        error: 'Invalid image URL or unable to fetch image: ' + imageError.message 
                    });
                }
            } else {
                // Assume it's already base64 without the data prefix
                photoBase64 = photo;
            }
        }

        const query = `
        UPDATE models 
        SET model_name = ?, rating = ?, price = ?, category = ?, photo = ?
        WHERE id = ?`;

        db.query(query, [
            model_name,
            rating,
            price,
            category,
            photoBase64,
            id
        ], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ 
                success: true,
                message: 'Model Updated Successfully'
            });
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// NEW: Delete model
app.delete('/api/models/:id', (req, res) => {
    const { id } = req.params;
    
    const query = 'DELETE FROM models WHERE id = ?';
    
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ 
            success: true,
            message: 'Model Deleted Successfully'
        });
    });
});

// User registration
app.post('/api/userinfo/insert', (req, res) => {
    const {
        Name,
        Email,
        City,
        Mobilenumber,
        Password
    } = req.body;

    const query = `
        INSERT INTO Tprd0AUsers
        (Name, Email, City, Mobilenumber, Password)
        VALUES(?,?,?,?,?)`;
    
    db.query(query, [Name, Email, City, Mobilenumber, Password], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'User Added Successfully', id: result.insertId });
    });
});

// User login
app.post('/api/userinfo/login', (req, res) => {
    const { Email, Password } = req.body;

    const query = `SELECT * FROM Tprd0AUsers WHERE Email = ? AND Password = ?`;
    db.query(query, [Email, Password], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        if (results.length > 0) {
            const user = results[0];
            res.json({ success: true, userId: user.id });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// Get user details
app.get('/api/userinfo/:userId', (req, res) => {
    const userId = req.params.userId;

    const query = `SELECT id, Name, Email, City, Mobilenumber FROM Tprd0AUsers WHERE id = ?`;
    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    });
});

// Get user info (generic)
app.get("/api/userinfo", (req, res) => {
    const sql = "SELECT Name, Email, City, MobileNumber FROM Tprd0AUsers LIMIT 1";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result[0]);
    });
});

// Get all models for shop
app.get('/api/shophub', (req, res) => {
    db.query('SELECT * FROM models', (err, results) => {
        if (err) return res.status(500).json(err);
        
        // Convert BLOB back to base64 for frontend display
        const processedResults = results.map(model => ({
            ...model,
            photo: model.photo ? model.photo.toString('base64') : null
        }));
        
        res.json(processedResults);
    });
});


app.get('/api/orders/plot',(req, res)=>{
  db.query('SELECT * FROM  orders',(err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});


// Database connection
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Database Connected.....!');
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));