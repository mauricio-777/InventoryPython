import uuid
import json
from flask import Blueprint, request, jsonify, send_file
from Database.config import get_db
from Report.Domain.dashboard import DashboardService
from Report.Domain.metrics import MetricsService
from Report.Adapters.sql_report_repository import SqlReportRepository
from CommonLayer.middleware.auth_middleware import require_role
from datetime import datetime, timezone
from io import StringIO
import csv

router = Blueprint('reports', __name__, url_prefix='/api/v1/reports')


@router.route('/dashboard', methods=['GET'])
@require_role('admin', 'gestor', 'consultor')
def get_dashboard():
    """Obtiene el resumen del dashboard con todos los indicadores clave"""
    try:
        db = next(get_db())
        service = DashboardService(db)
        
        low_stock_threshold = int(request.args.get('low_stock_threshold', 10))
        dashboard_data = service.get_dashboard_summary(low_stock_threshold)
        
        return jsonify({
            "status": "success",
            "data": dashboard_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@router.route('/dashboard/inventory-value', methods=['GET'])
@require_role('admin', 'gestor', 'consultor')
def get_inventory_value():
    """Obtiene el valor total del inventario"""
    try:
        db = next(get_db())
        service = DashboardService(db)
        total_value = service.get_total_inventory_value()
        
        return jsonify({
            "status": "success",
            "total_value": total_value,
            "currency": "Bs"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@router.route('/dashboard/low-stock', methods=['GET'])
@require_role('admin', 'gestor', 'consultor')
def get_low_stock():
    """Obtiene productos con stock bajo"""
    try:
        db = next(get_db())
        service = DashboardService(db)
        
        threshold = int(request.args.get('threshold', 10))
        low_stock = service.get_low_stock_products(threshold)
        
        return jsonify({
            "status": "success",
            "threshold": threshold,
            "products": low_stock
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@router.route('/dashboard/recent-movements', methods=['GET'])
@require_role('admin', 'gestor', 'consultor')
def get_recent_movements():
    """Obtiene los últimos movimientos"""
    try:
        db = next(get_db())
        service = DashboardService(db)
        
        limit = int(request.args.get('limit', 10))
        movements = service.get_recent_movements(limit)
        
        return jsonify({
            "status": "success",
            "movements": movements
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@router.route('/dashboard/rotation', methods=['GET'])
@require_role('admin', 'gestor', 'consultor')
def get_rotation_summary():
    """Obtiene el resumen de rotación del inventario"""
    try:
        db = next(get_db())
        service = DashboardService(db)
        
        days = int(request.args.get('days', 30))
        rotation = service.get_rotation_summary(days)
        
        return jsonify({
            "status": "success",
            "rotation": rotation
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@router.route('/valorization', methods=['GET'])
@require_role('admin', 'gestor', 'consultor')
def get_valorization_report():
    """
    Obtiene el reporte de valorización de inventario a una fecha determinada
    Query params: date (YYYY-MM-DD)
    """
    try:
        db = next(get_db())
        service = MetricsService(db)
        
        date_str = request.args.get('date')
        if not date_str:
            return jsonify({"error": "Missing 'date' parameter (YYYY-MM-DD)"}), 400
        
        try:
            target_date = datetime.fromisoformat(date_str).replace(tzinfo=timezone.utc)
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        report = service.get_inventory_value_at_date(target_date)
        
        return jsonify({
            "status": "success",
            "report": report
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@router.route('/valorization/export', methods=['GET'])
@require_role('admin', 'gestor', 'consultor')
def export_valorization_report():
    """
    Exporta el reporte de valorización en CSV o PDF
    Query params: date (YYYY-MM-DD), format (csv|pdf)
    """
    try:
        db = next(get_db())
        service = MetricsService(db)
        
        date_str = request.args.get('date')
        export_format = request.args.get('format', 'csv').lower()
        
        if not date_str:
            return jsonify({"error": "Missing 'date' parameter"}), 400
        
        if export_format not in ['csv', 'pdf', 'json']:
            return jsonify({"error": "Format debe ser 'csv', 'pdf' o 'json'"}), 400
        
        try:
            target_date = datetime.fromisoformat(date_str).replace(tzinfo=timezone.utc)
        except ValueError:
            return jsonify({"error": "Invalid date format"}), 400
        
        report = service.get_inventory_value_at_date(target_date)
        
        if export_format == 'json':
            return jsonify(report), 200
        
        elif export_format == 'csv':
            output = StringIO()
            writer = csv.writer(output)
            
            # Header
            writer.writerow(['Reporte de Valorización de Inventario'])
            writer.writerow(['Fecha', report['date']])
            writer.writerow(['Valor Total', f"Bs {report['total_value']}"])
            writer.writerow([])
            
            # Resumen por producto
            writer.writerow(['RESUMEN POR PRODUCTO'])
            writer.writerow(['Producto', 'SKU', 'Cantidad', 'Costo Unitario Promedio', 'Costo Total'])
            
            for product in report['details_by_product']:
                writer.writerow([
                    product['product_name'],
                    product['product_sku'],
                    product['total_quantity'],
                    f"Bs {product['average_unit_cost']}",
                    f"Bs {product['total_cost']}"
                ])
            
            writer.writerow([])
            writer.writerow(['DETALLE POR LOTE'])
            writer.writerow(['Producto', 'Lote ID', 'Cantidad', 'Costo Unitario', 'Costo Total'])
            
            for batch in report['details_by_batch']:
                writer.writerow([
                    batch['product_name'],
                    batch['batch_id'],
                    batch['quantity_available'],
                    f"Bs {batch['unit_cost']}",
                    f"Bs {batch['total_cost']}"
                ])
            
            output.seek(0)
            return send_file(
                StringIO(output.getvalue()),
                mimetype='text/csv',
                as_attachment=True,
                download_name=f"valorization_{date_str}.csv"
            )
        
        return jsonify({"error": "Formato no soportado"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@router.route('/rotation', methods=['GET'])
@require_role('admin', 'gestor', 'consultor')
def get_rotation_report():
    """
    Obtiene el reporte de rotación de inventario
    Query params: days (default 30), product_id (optional), category (optional)
    """
    try:
        db = next(get_db())
        service = MetricsService(db)
        
        days = int(request.args.get('days', 30))
        product_id = request.args.get('product_id')
        category = request.args.get('category')
        
        rotation_data = service.get_rotation_index(
            product_id=product_id,
            days=days,
            category=category
        )
        
        return jsonify({
            "status": "success",
            "period_days": days,
            "products": rotation_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@router.route('/movements/search', methods=['GET'])
@require_role('admin', 'gestor', 'consultor')
def search_movements():
    """
    Búsqueda avanzada de movimientos con filtros
    Query params: 
    - start_date (YYYY-MM-DD)
    - end_date (YYYY-MM-DD)
    - product_id
    - movement_type (ENTRY, EXIT, ADJUSTMENT)
    - user_id
    - skip (default 0)
    - limit (default 100)
    """
    try:
        db = next(get_db())
        repo = SqlReportRepository(db)
        
        # Parse parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        product_id = request.args.get('product_id')
        movement_type = request.args.get('movement_type')
        user_id = request.args.get('user_id')
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 100))
        
        # Parse dates
        start_date = None
        end_date = None
        
        if start_date_str:
            try:
                start_date = datetime.fromisoformat(start_date_str).replace(tzinfo=timezone.utc)
            except ValueError:
                return jsonify({"error": "Invalid start_date format"}), 400
        
        if end_date_str:
            try:
                end_date = datetime.fromisoformat(end_date_str).replace(tzinfo=timezone.utc)
            except ValueError:
                return jsonify({"error": "Invalid end_date format"}), 400
        
        movements = repo.search_movements(
            start_date=start_date,
            end_date=end_date,
            product_id=product_id,
            movement_type=movement_type,
            user_id=user_id,
            skip=skip,
            limit=limit
        )
        
        return jsonify({
            "status": "success",
            "count": len(movements),
            "movements": movements
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
