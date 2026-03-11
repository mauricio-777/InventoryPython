"""
seed_data.py — Datos de demostración completos para el sistema WMS.

Poblado con:
  - 3 usuarios (uno por rol: admin, gestor, consultor)
  - 12 productos de ferretería/suministros industriales
  - 10 clientes con datos realistas
  - 10 proveedores
  - 12 ubicaciones de almacén distribuidas en 3 zonas
  - Lotes de stock iniciales vinculados a ubicaciones

Este script se llama desde main.py al arrancar si la DB está vacía.
"""

import uuid
from datetime import datetime, timezone, timedelta
from werkzeug.security import generate_password_hash

from Database.config import SessionLocal
from User.Domain.user import User
from User.Domain.role import Role
from User.Adapters.user_repository import UserRepository, RoleRepository
from Product.Domain.product import Product
from Product.Domain.batch import Batch
from Product.Domain.movement import Movement, MovementType
from Stakeholder.Domain.customer import Customer
from Stakeholder.Domain.supplier import Supplier
from Warehouse.Domain.location import Location
from CommonLayer.logging.logger import get_logger

logger = get_logger(__name__)


def run_seed():
    """Ejecuta la carga de datos demo. Idempotente: no duplica si ya existen."""
    db = SessionLocal()
    try:
        _seed_all(db)
    finally:
        db.close()


def _seed_all(db):
    # ── 1. ROLES (idempotente) ──────────────────────────────────────────────
    role_repo = RoleRepository(db)
    roles_data = [
        {"name": "admin",     "description": "Acceso total: gestión de usuarios, auditoría y todas las funcionalidades."},
        {"name": "gestor",    "description": "Gestiona productos, lotes, entradas, salidas y reportes. Sin administración de usuarios."},
        {"name": "consultor", "description": "Solo lectura en todas las secciones del sistema."},
    ]
    role_map = {}
    for rd in roles_data:
        existing = role_repo.get_by_name(rd["name"])
        if not existing:
            role = Role(name=rd["name"], description=rd["description"])
            role_repo.create(role)
            existing = role_repo.get_by_name(rd["name"])
            logger.info("Rol '%s' creado.", rd["name"])
        role_map[rd["name"]] = existing

    # ── 2. USUARIOS ─────────────────────────────────────────────────────────
    user_repo = UserRepository(db)
    users_data = [
        {"username": "admin",     "email": "admin@wms.local",     "password": "admin123",     "role": "admin"},
        {"username": "gestor",    "email": "gestor@wms.local",    "password": "gestor123",    "role": "gestor"},
        {"username": "consultor", "email": "consultor@wms.local", "password": "consultor123", "role": "consultor"},
    ]
    for ud in users_data:
        # Verificar por username Y por email para evitar duplicados
        by_name  = user_repo.get_by_username(ud["username"])
        by_email = user_repo.get_by_email(ud["email"])
        if by_name or by_email:
            logger.info("Usuario '%s' ya existe, omitiendo.", ud["username"])
            continue
        try:
            user = User(
                id=str(uuid.uuid4()),
                username=ud["username"],
                email=ud["email"],
                password_hash=generate_password_hash(ud["password"]),
                active=True,
                role_id=role_map[ud["role"]].id,
            )
            user_repo.create(user)
            logger.info("Usuario creado: %s / %s  [%s]", ud["username"], ud["password"], ud["role"])
        except Exception as e:
            db.rollback()
            logger.warning("No se pudo crear usuario '%s': %s", ud["username"], e)

    # ── 3. PROVEEDORES ──────────────────────────────────────────────────────
    suppliers_raw = [
        ("Distribuidora FERROMAX S.A.",  "RUC", "20512345671", "Av. Industrial 123, Lima",      "+51 1 234-5678", "contacto@ferromax.pe",     30, "Crédito 30 días"),
        ("Suministros TECNIKA S.R.L.",   "RUC", "20512345672", "Jr. Metalúrgica 456, Callao",   "+51 1 234-5679", "ventas@tecnika.pe",        15, "Contado"),
        ("PROINDESA Perú",               "RUC", "20512345673", "Av. Argentina 789, Lima",       "+51 1 234-5680", "pedidos@proindesa.pe",     45, "Crédito 45 días"),
        ("Importaciones GLOBALTECH",     "RUC", "20512345674", "Calle Comercio 321, Lima",      "+51 1 234-5681", "global@globaltech.pe",      7, "Contado + flete"),
        ("ALMACOR Distribuciones",       "RUC", "20512345675", "Av. Materiales 654, Ate",       "+51 1 234-5682", "almacor@almacor.pe",       21, "Crédito 21 días"),
        ("Ferretería CONSTRUMAX",        "RUC", "20512345676", "Urb. Industrial 987, SJL",      "+51 1 234-5683", "construmax@mail.pe",       10, "Contado"),
        ("HERRATOOLS S.A.C.",            "RUC", "20512345677", "Av. Herramientas 147, Lima",    "+51 1 234-5684", "info@herratools.pe",       60, "Crédito 60 días"),
        ("Distribuidora SEGURIND",       "RUC", "20512345678", "Parque Industrial 258, Lurín",  "+51 1 234-5685", "segurind@segurind.pe",     14, "Contado"),
        ("ELECTROSUR Perú S.A.",         "RUC", "20512345679", "Av. Eléctrica 369, Lima",      "+51 1 234-5686", "electrosur@mail.pe",       30, "Crédito 30 días"),
        ("QUIMICOS DEL CENTRO S.A.C.",   "RUC", "20512345680", "Av. Química 741, Lima",        "+51 1 234-5687", "quimicos@centro.pe",       20, "Contado"),
    ]
    supplier_ids = []
    for s in suppliers_raw:
        existing = db.query(Supplier).filter(Supplier.numero_documento == s[2]).first()
        if not existing:
            sup = Supplier(
                id=str(uuid.uuid4()),
                nombre=s[0], tipo_documento=s[1], numero_documento=s[2],
                direccion=s[3], telefono=s[4], email=s[5],
                plazo_entrega_dias=s[6], condiciones_compra=s[7]
            )
            sup.set_audit_create("admin")
            db.add(sup)
            db.commit()
            db.refresh(sup)
            supplier_ids.append(sup.id)
            logger.info("Proveedor creado: %s", s[0])
        else:
            supplier_ids.append(existing.id)

    # ── 4. CLIENTES ─────────────────────────────────────────────────────────
    customers_raw = [
        ("Constructora EDIFICORP S.A.",  "RUC", "20601234561", "Av. Constructores 100, Miraflores", "+51 987 654 321", "compras@edificorp.pe",   "CREDITO",  "WHATSAPP",   "DELIVERY_DOMICILIO"),
        ("Taller METALWORK Lima",        "DNI", "12345678",    "Jr. Talleres 200, Ate",             "+51 987 654 322", "metalwork@mail.pe",      "CONTADO",  "PRESENCIAL", "RECOGE_TIENDA"),
        ("MINERA ANDINA S.A.C.",         "RUC", "20601234562", "Av. Minería 300, Cercado",          "+51 987 654 323", "minera@andina.pe",       "CREDITO",  "ONLINE",     "COURIER"),
        ("Hospital SALUD TOTAL",         "RUC", "20601234563", "Calle Salud 400, SMP",              "+51 987 654 324", "logistica@saludtotal.pe","CREDITO",  "TELEFONO",   "DELIVERY_DOMICILIO"),
        ("Empresa LIMPIEZA TOTAL S.R.L.","RUC", "20601234564", "Av. Limpieza 500, Surco",           "+51 987 654 325", "lima@limpiezatotal.pe",  "CONTADO",  "WHATSAPP",   "RECOGE_TIENDA"),
        ("AGRO-PERU Productos",          "RUC", "20601234565", "Carretera Central 600, Ate",        "+51 987 654 326", "agroperu@mail.pe",       "CREDITO",  "ONLINE",     "COURIER"),
        ("Municipalidad de San Borja",   "RUC", "20601234566", "Av. Municipal 700, San Borja",      "+51 987 654 327", "muni@sanborja.gob.pe",   "CREDITO",  "PRESENCIAL", "DELIVERY_DOMICILIO"),
        ("Taller FIERROS & CIA.",        "DNI", "23456789",    "Jr. Fierros 800, Villa María",      "+51 987 654 328", "fierros@mail.pe",        "CONTADO",  "PRESENCIAL", "RECOGE_TIENDA"),
        ("SUPERMERCADOS EL AHORRO S.A.", "RUC", "20601234567", "Av. Comercio 900, La Victoria",     "+51 987 654 329", "logistica@elahorro.pe",  "CREDITO",  "ONLINE",     "DELIVERY_DOMICILIO"),
        ("PESQUERA MAR AZUL S.A.C.",     "RUC", "20601234568", "Muelle 12, Callao",                 "+51 987 654 330", "compras@marazul.pe",     "CREDITO",  "TELEFONO",   "COURIER"),
    ]
    customer_ids = []
    for c in customers_raw:
        existing = db.query(Customer).filter(Customer.numero_documento == c[2]).first()
        if not existing:
            cust = Customer(
                id=str(uuid.uuid4()),
                nombre=c[0], tipo_documento=c[1], numero_documento=c[2],
                direccion=c[3], telefono=c[4], email=c[5],
                condicion_pago=c[6], canal_pedido=c[7], canal_entrega=c[8]
            )
            cust.set_audit_create("admin")
            db.add(cust)
            db.commit()
            db.refresh(cust)
            customer_ids.append(cust.id)
            logger.info("Cliente creado: %s", c[0])
        else:
            customer_ids.append(existing.id)

    # ── 5. UBICACIONES DEL ALMACÉN ──────────────────────────────────────────
    locations_raw = [
        # Zona A — Materiales Secos
        ("A", "01", "A", "01"), ("A", "01", "A", "02"), ("A", "01", "B", "01"),
        ("A", "02", "A", "01"), ("A", "02", "B", "01"),
        # Zona B — Herramientas y Equipos
        ("B", "01", "A", "01"), ("B", "01", "A", "02"), ("B", "02", "A", "01"),
        # Zona C — Insumos Químicos / Refrigerado
        ("C", "01", "A", "01"), ("C", "01", "A", "02"), ("C", "02", "A", "01"), ("C", "02", "B", "01"),
    ]
    location_ids = []
    for z, a, r, lv in locations_raw:
        existing = db.query(Location).filter(
            Location.zone == z, Location.aisle == a,
            Location.rack == r, Location.level == lv
        ).first()
        if not existing:
            loc = Location(id=str(uuid.uuid4()), zone=z, aisle=a, rack=r, level=lv)
            loc.set_audit_create("admin")
            db.add(loc)
            db.commit()
            db.refresh(loc)
            location_ids.append(loc.id)
            logger.info("Ubicación creada: %s-%s-%s-%s", z, a, r, lv)
        else:
            location_ids.append(existing.id)

    # ── 6. PRODUCTOS ─────────────────────────────────────────────────────────
    products_raw = [
        # (sku, name, description, category, unit_measure, suggested_price, is_perishable)

        # ── Alimentos / Abarrotes (PERECEDEROS) ─────────────────────────────
        ("ALIM-001", "Harina de Trigo Extra x 50 kg",
         "Saco 50 kg, harina 0000, apta para panadería industrial",
         "Alimentos",       "Saco",       85.00, True),

        ("ALIM-002", "Azúcar Rubia x 50 kg",
         "Saco 50 kg, azúcar rubia granulada, origen nacional",
         "Alimentos",       "Saco",       95.00, True),

        ("ALIM-003", "Aceite Vegetal Envasado x 20 L",
         "Bidón 20 L, aceite de soya refinado, sin colesterol",
         "Alimentos",       "Bidón",     120.00, True),

        ("ALIM-004", "Leche UHT Entera x 1 L",
         "Caja de 12 unidades, pasteurización UHT, 3% grasa",
         "Alimentos",       "Caja x12",   42.00, True),

        ("ALIM-005", "Arroz Largo Extra x 50 kg",
         "Saco 50 kg, grano largo, categoría extra",
         "Alimentos",       "Saco",       75.00, True),

        # ── Farmacéuticos / Higiene (PERECEDEROS) ────────────────────────────
        ("FARM-001", "Alcohol Isopropílico 70% x 1 L",
         "Frasco 1 litro, antiséptico, uso médico e industrial",
         "Farmacéutico",    "Frasco",     18.50, True),

        ("FARM-002", "Guantes Látex Estériles Talla M",
         "Caja x 50 pares estériles, uso quirúrgico, libre de polvo",
         "Farmacéutico",    "Caja x50",   95.00, True),

        ("FARM-003", "Mascarilla KN95 (Pack x 20)",
         "Filtración ≥95%, 5 capas, con clip nasal ajustable",
         "Farmacéutico",    "Pack x20",   38.00, True),

        ("FARM-004", "Gel Antibacterial 500 ml",
         "Frasco dispensador 500 ml, 70% alcohol, sin enjuague",
         "Farmacéutico",    "Frasco",     12.00, True),

        # ── Limpieza Industrial (PERECEDEROS) ────────────────────────────────
        ("LIMP-001", "Detergente Industrial x 20 kg",
         "Saco 20 kg, uso industrial, bajo índice de espuma",
         "Limpieza",        "Saco",       65.00, True),

        ("LIMP-002", "Hipoclorito de Sodio 10% x 20 L",
         "Bidón 20 L, uso desinfectante, cloro activo 10%",
         "Limpieza",        "Bidón",      28.00, True),

        ("LIMP-003", "Desengrasante Multiusos x 5 L",
         "Galón 5 L concentrado, base alcalina, biodegradable",
         "Limpieza",        "Galón",      32.00, True),

        # ── Herramientas Eléctricas (NO PERECEDEROS) ─────────────────────────
        ("HERR-001", "Taladro Inalámbrico 18V",
         "Taladro percutor a batería, 2 velocidades, chuck 13 mm",
         "Herramientas",    "Unidad",    349.90, False),

        ("HERR-002", "Amoladora Angular 4½\" 850W",
         "850W, disco 115 mm, 11 000 RPM, palanca anti-bloqueo",
         "Herramientas",    "Unidad",    189.90, False),

        ("HERR-003", "Llave de Impacto Neumática ½\"",
         "550 Nm par máximo, 8 000 RPM, mango ergonómico",
         "Herramientas",    "Unidad",    275.00, False),

        ("HERR-004", "Sierra Circular 7¼\" 1400W",
         "Profundidad de corte 65 mm a 90°, guía paralela incluida",
         "Herramientas",    "Unidad",    265.00, False),

        # ── Seguridad Industrial (NO PERECEDEROS) ────────────────────────────
        ("SEGUR-001", "Casco de Seguridad ABS Clase E",
         "Ventilado, arnés 4 puntos, talla única ajustable",
         "Seguridad",       "Unidad",     32.50, False),

        ("SEGUR-002", "Arnés de Seguridad Doble Cola",
         "Certificado ANSI Z359, resistencia 22 kN, talla única",
         "Seguridad",       "Unidad",    185.00, False),

        ("SEGUR-003", "Bota Punta Acero Talla 42",
         "Cuero plena flor, suela antideslizante, resistente aceite",
         "Seguridad",       "Par",        89.00, False),

        # ── Eléctrico (NO PERECEDEROS) ───────────────────────────────────────
        ("ELECT-001", "Cable THW #12 AWG x 100 m",
         "Rollo 100 m, conductor cobre, aislamiento PVC 600V",
         "Eléctrico",       "Rollo",     145.00, False),

        ("ELECT-002", "Interruptor Termomagnético 2×20A",
         "Riel DIN, 220V, capacidad de ruptura 6 kA",
         "Eléctrico",       "Unidad",     38.50, False),

        # ── Plomería / Construcción (NO PERECEDEROS) ─────────────────────────
        ("PLOM-001",  "Tubo PVC Desagüe 3\" × 3 m",
         "NTP ISO 4435, espesor 3.2 mm, unión espiga campana",
         "Plomería",        "Unidad",     22.80, False),

        ("PLOM-002",  "Cemento Portland Tipo I x 42.5 kg",
         "Bolsa 42.5 kg, uso estructural y acabados generales",
         "Construcción",    "Bolsa",      28.00, False),
    ]
    product_ids = []
    for idx, (sku, name, desc, cat, unit, price, perish) in enumerate(products_raw):
        existing = db.query(Product).filter(Product.sku == sku).first()
        if not existing:
            prod = Product(
                id=str(uuid.uuid4()),
                sku=sku, name=name, description=desc, category=cat,
                unit_measure=unit, unit_value=1.0,
                is_perishable=perish, suggested_price=price
            )
            prod.set_audit_create("admin")
            db.add(prod)
            db.commit()
            db.refresh(prod)
            product_ids.append(prod.id)
            logger.info("Producto creado: %s - %s", sku, name)
        else:
            product_ids.append(existing.id)

    # ── 7. LOTES INICIALES DE STOCK ─────────────────────────────────────────
    # Crear un lote por producto con stock inicial realista
    # Datos: (product_idx, quantity, unit_cost, location_idx, supplier_idx, expiry_days)
    # Índices: productos 0-11 son perecederos, 12-23 son no perecederos
    # Ubicaciones: 0-4 = Zona A (secos), 5-7 = Zona B (herramientas), 8-11 = Zona C (perecederos)
    batches_raw = [
        # Perecederos → Zona C o Zona A (alimentos en seco)
        ( 0, 200,  55.00,  0, 4, 180),  # Harina 50kg → A-01-A-01, expira 6 meses
        ( 1, 150,  62.00,  1, 4, 180),  # Azúcar 50kg → A-01-A-02, expira 6 meses
        ( 2,  60,  78.00,  2, 4, 365),  # Aceite 20L  → A-01-B-01, expira 1 año
        ( 3, 120,  26.00,  8, 4, 120),  # Leche UHT   → C-01-A-01, expira 4 meses
        ( 4, 180,  48.00,  3, 4, 365),  # Arroz 50kg  → A-02-A-01, expira 1 año
        ( 5, 200,  10.00,  8, 7, 180),  # Alcohol iso → C-01-A-01, expira 6 meses
        ( 6,  80,  58.00,  9, 7,  540), # Guantes látex→ C-01-A-02, expira 18 meses
        ( 7, 100,  22.00,  9, 7,  730), # Mascarilla  → C-01-A-02, expira 2 años
        ( 8, 300,   7.00, 10, 7,  365), # Gel antibact→ C-02-A-01, expira 1 año
        ( 9, 100,  40.00, 10, 9,  365), # Detergente  → C-02-A-01, expira 1 año
        (10,  80,  17.00, 11, 9,  365), # Hipoclorito → C-02-B-01, expira 1 año
        (11,  60,  20.00, 11, 9,  180), # Desengrasante→ C-02-B-01, expira 6 meses
        # No perecederos → Zona A o B
        (12,  25, 220.00,  5, 0,    0), # Taladro 18V → B-01-A-01
        (13,  40, 120.00,  5, 0,    0), # Amoladora   → B-01-A-01
        (14,  15, 175.00,  6, 1,    0), # Llave impacto→ B-01-A-02
        (15,  20, 168.00,  6, 0,    0), # Sierra circ.→ B-01-A-02
        (16, 120,  18.00,  0, 5,    0), # Casco segur.→ A-01-A-01
        (17,  30, 115.00,  2, 5,    0), # Arnés       → A-01-B-01
        (18,  50,  52.00,  7, 5,    0), # Botas acero → B-02-A-01
        (19,  35,  95.00,  4, 8,    0), # Cable THW   → A-02-B-01
        (20,  90,  22.00,  3, 8,    0), # Interruptor → A-02-A-01
        (21,  80,  13.50,  4, 2,    0), # Tubo PVC    → A-02-B-01
        (22, 300,  16.00,  1, 5,    0), # Cemento     → A-01-A-02
        (23,   0,   0.00,  0, 0,    0), # (reserva)
    ]

    now = datetime.now(timezone.utc)
    from Product.Adapters.movement_repository import MovementRepository
    for prod_idx, qty, cost, loc_idx, sup_idx, expiry_days in batches_raw:
        if qty == 0:
            continue  # Entrada vacía / reserva
        if prod_idx >= len(product_ids) or loc_idx >= len(location_ids) or sup_idx >= len(supplier_ids):
            continue
        pid = product_ids[prod_idx]
        # ¿Ya hay lotes activos para este producto?
        repo = MovementRepository(db)
        existing_batches = repo.get_batches_by_product(pid, active_only=True)
        if existing_batches:
            continue  # Ya tiene stock, no duplicar

        lid = location_ids[loc_idx]
        sid = supplier_ids[sup_idx]
        expiry = (now + timedelta(days=expiry_days)) if expiry_days > 0 else None

        batch = Batch(
            id=str(uuid.uuid4()),
            product_id=pid,
            initial_quantity=qty,
            available_quantity=qty,
            unit_cost=cost,
            purchase_date=now - timedelta(days=15),
            expiration_date=expiry,
            supplier_id=sid,
            location_id=lid,
            entry_transaction_ref=f"OC-{2025000 + prod_idx + 1}"
        )
        batch.set_audit_create("admin")
        db.add(batch)

        # Movimiento de entrada correspondiente
        mov = Movement(
            id=str(uuid.uuid4()),
            product_id=pid,
            type=MovementType.ENTRY,
            quantity=qty,
            unit_price=cost,
            total_price=cost * qty,
            supplier_id=sid,
            reference_id=batch.id,
            notes="Stock inicial de apertura"
        )
        mov.set_audit_create("admin")
        db.add(mov)

    db.commit()
    logger.info("✅ Seed completo: %d productos, clientes, proveedores, ubicaciones y lotes cargados.", len(product_ids))
