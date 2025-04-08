require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
// Servir archivos estáticos (esto hace que Express sirva archivos desde la carpeta public)
app.use(express.static('public'));

// Ruta para favicon.ico
app.get('/favicon.ico', (req, res) => res.sendFile(__dirname + '/public/favicon.ico'));


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Esquema del miembro
const MemberSchema = new mongoose.Schema({
    memberNumber: String,
    fullName: String,
    paymentDate: Date,
    expirationDate: Date
});

const Member = mongoose.model('Member', MemberSchema);

// Ruta para agregar un miembro
app.post('/add-member', async (req, res) => {
    try {
        const newMember = new Member(req.body);
        await newMember.save();
        res.status(201).send("Membresía registrada");
    } catch (error) {
        res.status(500).send(error);
    }
});

// Ruta para obtener miembros
app.get('/members', async (req, res) => {
    try {
        const members = await Member.find();
        res.json(members);
    } catch (error) {
        res.status(500).send(error);
    }
});
// Ruta para editar un miembro
app.put('/edit-member/:id', async (req, res) => {
    try {
        const updatedMember = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedMember);
    } catch (error) {
        res.status(500).send(error);
    }
});
// Ruta para eliminar un miembro
app.delete('/delete-member/:id', async (req, res) => {
    try {
        await Member.findByIdAndDelete(req.params.id);
        res.status(200).send("Miembro eliminado");
    } catch (error) {
        res.status(500).send(error);
    }
});
// Ruta para consultar un miembro por su número de miembro
app.get('/member/:memberNumber', async (req, res) => {
    try {
        const memberNumber = req.params.memberNumber.trim();  // Eliminar espacios extra
        console.log("Buscando miembro con el número:", memberNumber);  // Depuración

        const member = await Member.findOne({ memberNumber: memberNumber }); // Buscar en la base de datos

        if (!member) {
            return res.status(404).send("Miembro no encontrado");
        }

        res.json(member);  // Si lo encuentra, lo devuelve
    } catch (error) {
        console.error("Error en la búsqueda del miembro:", error);  // Mostrar el error
        res.status(500).send("Error en el servidor");
    }
});
// Esquema del producto
const ProductSchema = new mongoose.Schema({
    productId: String,
    name: String,
    stockQuantity: Number,
    price: Number,
    soldQuantity: { type: Number, default: 0 },
    dateAdded: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);

// Ruta para agregar un producto
app.post('/add-product', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).send("Producto agregado");
    } catch (error) {
        res.status(500).send(error);
    }
});

// Ruta para vender un producto (reducir el stock)
app.post('/sell-product/:id', async (req, res) => {
    try {
        const { quantitySold } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send("Producto no encontrado");

        // Verificar que hay suficiente stock
        if (product.stockQuantity < quantitySold) {
            return res.status(400).send("No hay suficiente stock");
        }

        // Reducir el stock y actualizar la cantidad vendida
        product.stockQuantity -= quantitySold;
        product.soldQuantity += quantitySold;

        await product.save();
        res.status(200).send("Producto vendido");
    } catch (error) {
        res.status(500).send(error);
    }
});

// Ruta para obtener todos los productos
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).send(error);
    }
});
// Ruta para eliminar un producto por ID
app.delete('/delete-product/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).send("Producto no encontrado");
        res.status(200).send("Producto eliminado");
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/favicon.ico', (req, res) => res.status(204));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

