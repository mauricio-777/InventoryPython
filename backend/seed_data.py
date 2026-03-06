import os
import uuid
from werkzeug.security import generate_password_hash
from Database.config import Base, engine, SessionLocal

# Importar todos los modelos para que Base.metadata.create_all() los reconozca
from User.Domain.role import Role
from User.Domain.user import User
from Product.Domain.product import Product
from Stakeholder.Domain.customer import Customer
from Stakeholder.Domain.supplier import Supplier
# Otros modelos necesarios para la DB
from Product.Domain.batch import Batch
from Product.Domain.movement import Movement
from Product.Domain.price_history import PriceHistory
from Audit.Domain.audit_log import AuditLog

# 1. Eliminar la base de datos anterior
DB_PATH = "./inventory.db"
if os.path.exists(DB_PATH):
    print(f"Eliminando base de datos existente: {DB_PATH}")
    os.remove(DB_PATH)
else:
    print("No se encontró base de datos anterior. Creando una nueva...")

# 2. Crear todas las tablas
print("Creando esquema de base de datos...")
Base.metadata.create_all(bind=engine)

# 3. Iniciar sesión e insertar datos
db = SessionLocal()

try:
    print("Insertando roles...")
    role_admin = Role(name="admin", description="Administrador del sistema")
    role_gestor = Role(name="gestor", description="Gestor operativo de inventario")
    role_consultor = Role(name="consultor", description="Consultor de solo lectura")
    db.add_all([role_admin, role_gestor, role_consultor])
    db.commit()

    print("Insertando usuarios...")
    user_admin = User(
        id=str(uuid.uuid4()),
        username="Admin",
        email="admin@empresa.com",
        password_hash=generate_password_hash("admin123"),
        active=True,
        role_id=role_admin.id
    )
    user_gestor = User(
        id=str(uuid.uuid4()),
        username="gestor",
        email="gestor@empresa.com",
        password_hash=generate_password_hash("gestor123"),
        active=True,
        role_id=role_gestor.id
    )
    user_consultor = User(
        id=str(uuid.uuid4()),
        username="consultor",
        email="consultor@empresa.com",
        password_hash=generate_password_hash("consultor123"),
        active=True,
        role_id=role_consultor.id
    )
    db.add_all([user_admin, user_gestor, user_consultor])
    db.commit()

    print("Insertando productos (5 perecederos, 5 no perecederos)...")
    productos = [
        # No perecederos
        Product(id=str(uuid.uuid4()), sku="BOT-AGU-500", name="Botella de Agua 500ml", category="Bebidas", unit_measure="UNIDAD", unit_value=1.0, is_perishable=False, suggested_price=3.0),
        Product(id=str(uuid.uuid4()), sku="REF-COC-2L", name="Coca-Cola 2L", category="Bebidas", unit_measure="UNIDAD", unit_value=1.0, is_perishable=False, suggested_price=12.0),
        Product(id=str(uuid.uuid4()), sku="LIM-ESC-01", name="Escoba Mágica", category="Limpieza", unit_measure="UNIDAD", unit_value=1.0, is_perishable=False, suggested_price=25.0),
        Product(id=str(uuid.uuid4()), sku="LIM-DTR-1KG", name="Detergente en Polvo 1Kg", category="Limpieza", unit_measure="BOLSA", unit_value=1.0, is_perishable=False, suggested_price=18.5),
        Product(id=str(uuid.uuid4()), sku="PAN-PAP-01", name="Paquete Papel Higiénico x6", category="Limpieza", unit_measure="PAQUETE", unit_value=1.0, is_perishable=False, suggested_price=15.0),
        # Perecederos
        Product(id=str(uuid.uuid4()), sku="LAC-LEC-1L", name="Leche Entera 1L", category="Lácteos", unit_measure="CAJA", unit_value=1.0, is_perishable=True, suggested_price=7.0),
        Product(id=str(uuid.uuid4()), sku="LAC-YOG-2L", name="Yogurt Frutilla 2L", category="Lácteos", unit_measure="BOTELLA", unit_value=1.0, is_perishable=True, suggested_price=16.0),
        Product(id=str(uuid.uuid4()), sku="QSO-CRA-500", name="Queso Crema 500g", category="Lácteos", unit_measure="ENVASE", unit_value=1.0, is_perishable=True, suggested_price=22.0),
        Product(id=str(uuid.uuid4()), sku="CAR-POL-1KG", name="Pollo Entero Crudo", category="Carnes", unit_measure="KILO", unit_value=1.0, is_perishable=True, suggested_price=15.5),
        Product(id=str(uuid.uuid4()), sku="CAR-VAC-1KG", name="Carne de Primera Vacuno", category="Carnes", unit_measure="KILO", unit_value=1.0, is_perishable=True, suggested_price=45.0),
    ]
    db.add_all(productos)
    db.commit()

    print("Insertando clientes (10)...")
    clientes = [
        Customer(id=str(uuid.uuid4()), nombre="Juan Pérez", tipo_documento="DNI", numero_documento="11223344", direccion="Calle Las Rosas 123", telefono="70012345", email="juan.perez@email.com", condicion_pago="CONTADO", canal_pedido="PRESENCIAL", canal_entrega="RECOGE_TIENDA"),
        Customer(id=str(uuid.uuid4()), nombre="María Gómez", tipo_documento="DNI", numero_documento="22334455", direccion="Av. Libertador 456", telefono="71123456", email="maria.gomez@email.com", condicion_pago="CONTADO", canal_pedido="WHATSAPP", canal_entrega="DELIVERY_DOMICILIO"),
        Customer(id=str(uuid.uuid4()), nombre="Tienda La Esquina SRL", tipo_documento="RUC", numero_documento="12345678901", direccion="Mercado Central Local 12", telefono="72234567", email="tienda.esquina@empresa.com", condicion_pago="CREDITO", canal_pedido="TELEFONO", canal_entrega="DELIVERY_DOMICILIO"),
        Customer(id=str(uuid.uuid4()), nombre="Restaurante El Buen Sabor", tipo_documento="RUC", numero_documento="10987654321", direccion="Plaza Principal", telefono="73345678", email="elbuensabor@restaurante.com", condicion_pago="CREDITO", canal_pedido="WHATSAPP", canal_entrega="RECOGE_TIENDA"),
        Customer(id=str(uuid.uuid4()), nombre="Carlos Ruiz", tipo_documento="DNI", numero_documento="33445566", direccion="Barrio Sur Calle 4", telefono="74456789", email="carlos.ruiz@email.com", condicion_pago="CONTADO", canal_pedido="ONLINE", canal_entrega="DELIVERY_DOMICILIO"),
        Customer(id=str(uuid.uuid4()), nombre="Ana Torres", tipo_documento="DNI", numero_documento="44556677", direccion="Condominio El Parque", telefono="75567890", email="ana.torres@email.com", condicion_pago="CONTADO", canal_pedido="PRESENCIAL", canal_entrega="COURIER"),
        Customer(id=str(uuid.uuid4()), nombre="Hotel Las Palmas SA", tipo_documento="RUC", numero_documento="20123456789", direccion="Av. Costanera 900", telefono="76678901", email="compras@laspalmas.com", condicion_pago="CREDITO", canal_pedido="TELEFONO", canal_entrega="DELIVERY_DOMICILIO"),
        Customer(id=str(uuid.uuid4()), nombre="Lucía Fernández", tipo_documento="DNI", numero_documento="55667788", direccion="Calle Los Andes 34", telefono="77789012", email="lucia.fer@email.com", condicion_pago="CONTADO", canal_pedido="WHATSAPP", canal_entrega="RECOGE_TIENDA"),
        Customer(id=str(uuid.uuid4()), nombre="Colegio San Ignacio", tipo_documento="RUC", numero_documento="20987654321", direccion="Zona Norte", telefono="78890123", email="admi@sanignacio.edu", condicion_pago="CREDITO", canal_pedido="ONLINE", canal_entrega="COURIER"),
        Customer(id=str(uuid.uuid4()), nombre="Pedro Martínez", tipo_documento="DNI", numero_documento="66778899", direccion="Av. Bolivar 876", telefono="79901234", email="pedro.martinez@email.com", condicion_pago="CONTADO", canal_pedido="PRESENCIAL", canal_entrega="RECOGE_TIENDA"),
    ]
    db.add_all(clientes)
    db.commit()

    print("Insertando proveedores (10)...")
    proveedores = [
        Supplier(id=str(uuid.uuid4()), nombre="Embotelladora Nacional SA", tipo_documento="RUC", numero_documento="30111111111", direccion="Camino a la Plata Km 5", telefono="2111111", email="ventas@embotelladora.com", plazo_entrega_dias=2, condiciones_compra="Pedido mínimo de 50 cajas"),
        Supplier(id=str(uuid.uuid4()), nombre="Lácteos de la Pradera SRL", tipo_documento="RUC", numero_documento="30222222222", direccion="Av. Ganadera s/n", telefono="2222222", email="pedidos@lapridera.com", plazo_entrega_dias=1, condiciones_compra="Pago a 30 días"),
        Supplier(id=str(uuid.uuid4()), nombre="Distribuidora de Carnes El Toro", tipo_documento="RUC", numero_documento="30333333333", direccion="Matadero Municipal Local 3", telefono="2333333", email="eltorocarnes@email.com", plazo_entrega_dias=1, condiciones_compra="Pago contra entrega"),
        Supplier(id=str(uuid.uuid4()), nombre="Limpieza Suprema Corp", tipo_documento="RUC", numero_documento="30444444444", direccion="Parque Industrial Bodega 10", telefono="2444444", email="ventas@limpiezasuprema.com", plazo_entrega_dias=3, condiciones_compra="Pedido mínimo 1000 Bs"),
        Supplier(id=str(uuid.uuid4()), nombre="Aguas Frescas Manantial", tipo_documento="RUC", numero_documento="30555555555", direccion="Vertiente Valle", telefono="2555555", email="manantial@aguas.com", plazo_entrega_dias=2, condiciones_compra="Crédito a 15 días"),
        Supplier(id=str(uuid.uuid4()), nombre="Importadora Oriente", tipo_documento="RUC", numero_documento="30666666666", direccion="Av. Comercial 4º Anillo", telefono="2666666", email="importadora@oriente.com", plazo_entrega_dias=5, condiciones_compra="50% anticipo"),
        Supplier(id=str(uuid.uuid4()), nombre="Granja Avícola Sofia", tipo_documento="RUC", numero_documento="30777777777", direccion="Carretera Norte", telefono="2777777", email="sofia@granja.com", plazo_entrega_dias=1, condiciones_compra="Entrega todos los días a las 6AM"),
        Supplier(id=str(uuid.uuid4()), nombre="Papelera del Sur", tipo_documento="RUC", numero_documento="30888888888", direccion="Ruta 9 Sur", telefono="2888888", email="ventas@papelerasur.com", plazo_entrega_dias=3, condiciones_compra="Pago corriente por mes"),
        Supplier(id=str(uuid.uuid4()), nombre="Distribuidora Mayorista Express", tipo_documento="RUC", numero_documento="30999999999", direccion="Mercado Abasto central", telefono="2999999", email="express@mayorista.com", plazo_entrega_dias=1, condiciones_compra="Descuento del 5% al contado"),
        Supplier(id=str(uuid.uuid4()), nombre="Fábrica de Plásticos ABC", tipo_documento="RUC", numero_documento="31000000000", direccion="Zona Industrial 33", telefono="2100000", email="fabrica.abc@plasticos.com", plazo_entrega_dias=7, condiciones_compra="Pedido anticipado"),
    ]
    db.add_all(proveedores)
    db.commit()

    print("\n===============================")
    print("¡Base de datos sembrada con éxito!")
    print("===============================")
    print("Credenciales:")
    print(" - Admin:")
    print("   Usuario: Admin")
    print("   Constraseña: admin123")
    print(" - Gestor:")
    print("   Usuario: gestor")
    print("   Constraseña: gestor123")
    print(" - Consultor:")
    print("   Usuario: consultor")
    print("   Constraseña: consultor123")
    print("\nRegistros generados:")
    print(f" - {len(productos)} productos (5 perecederos, 5 no perecederos)")
    print(f" - {len(clientes)} clientes")
    print(f" - {len(proveedores)} proveedores")

except Exception as e:
    db.rollback()
    print(f"Error sembrando la base de datos: {str(e)}")
finally:
    db.close()
